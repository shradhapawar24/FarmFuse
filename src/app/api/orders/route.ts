import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/prisma";

const directStatuses = ["PENDING", "ACCEPTED", "REJECTED", "PREPARING", "READY", "COMPLETED"] as const;
const workflowStatuses = ["ORDER_PLACED", "MATCHED", "COLLECTION", "COLLECTION_POINT", "CONSOLIDATION", "DISPATCHED", "DELIVERED"] as const;
type DirectStatus = typeof directStatuses[number];
type WorkflowStatus = typeof workflowStatuses[number];

type OrderInput = { listingId: string; quantity: number };

function sessionEmail(request: Request) {
  const cookie = request.headers.get("cookie")?.match(/farmfuse_session=([^;]+)/)?.[1];
  if (!cookie) return "";
  try {
    return JSON.parse(decodeURIComponent(cookie)).email ?? "";
  } catch {
    return "";
  }
}

function orderCode() {
  return `FF-${randomBytes(3).toString("hex").toUpperCase()}`;
}

const orderInclude = {
  buyer: true,
  farmer: true,
  items: { include: { produce: { include: { farmer: true } } } },
  farmPool: { include: { bulkOrder: { include: { items: true } }, members: { include: { produce: { include: { farmer: true } } } } } },
} as const;

export async function GET(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ orders: [], source: "database-required" }, { status: 503 });
  const user = await prisma.user.findUnique({ where: { email: sessionEmail(request) } });
  if (!user) return NextResponse.json({ error: "Sign in to view orders." }, { status: 401 });
  const where = user.role === "BUYER"
    ? { buyerId: user.id }
    : { OR: [{ farmerId: user.id }, { items: { some: { produce: { farmerId: user.id } } } }, { farmPool: { members: { some: { produce: { farmerId: user.id } } } } }] };
  const orders = await prisma.order.findMany({ where, include: orderInclude, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ orders, source: "database" });
}

export async function POST(request: Request) {
  try {
    if (!databaseConfigured()) return NextResponse.json({ error: "Database is required to place an order." }, { status: 503 });
    const body = await request.json() as { items?: OrderInput[] };
    const items = body.items ?? [];
    if (!items.length || items.some((item) => !item.listingId || !Number.isFinite(item.quantity) || item.quantity <= 0)) return NextResponse.json({ error: "Add a valid product quantity before checkout." }, { status: 400 });
    const buyer = await prisma.user.findUnique({ where: { email: sessionEmail(request) } });
    if (!buyer || buyer.role !== "BUYER") return NextResponse.json({ error: "Sign in as a buyer to place an order." }, { status: 401 });
    const listingIds = items.map((item) => item.listingId);
    const listings = await prisma.produce.findMany({ where: { id: { in: listingIds }, available: true }, include: { farmer: true } });
    const byId = new Map(listings.map((listing) => [listing.id, listing]));
    for (const item of items) {
      const listing = byId.get(item.listingId);
      if (!listing) return NextResponse.json({ error: "One of the selected listings is no longer available." }, { status: 409 });
      if (item.quantity > listing.quantityKg) return NextResponse.json({ error: `${listing.crop} has only ${listing.quantityKg} kg available.` }, { status: 409 });
    }
    const totalAmount = items.reduce((total, item) => total + item.quantity * (byId.get(item.listingId)?.pricePerKg ?? 0), 0);
    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const listing = byId.get(item.listingId)!;
        const reserved = await tx.produce.updateMany({ where: { id: listing.id, available: true, quantityKg: { gte: item.quantity } }, data: { quantityKg: { decrement: item.quantity } } });
        if (reserved.count !== 1) throw new Error("INVENTORY_CHANGED");
        await tx.produce.update({ where: { id: listing.id }, data: { available: listing.quantityKg - item.quantity > 0 } });
      }
      return tx.order.create({
        data: {
          orderCode: orderCode(),
          buyerId: buyer.id,
          farmerId: listings.length === 1 ? listings[0].farmerId : null,
          status: "PENDING",
          totalAmount,
          items: { create: items.map((item) => { const listing = byId.get(item.listingId)!; return { produceId: listing.id, crop: listing.crop, quantityKg: item.quantity, unit: "kg", pricePerKg: listing.pricePerKg }; }) },
        },
        include: orderInclude,
      });
    }, { timeout: 15000 });
    return NextResponse.json({ order: result }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVENTORY_CHANGED") return NextResponse.json({ error: "Inventory changed while placing the order. Refresh and try again." }, { status: 409 });
    console.error("Order creation failed", error);
    return NextResponse.json({ error: "Could not place the order." }, { status: 500 });
  }
}

function nextDirectStatuses(status: DirectStatus): DirectStatus[] {
  return status === "PENDING" ? ["ACCEPTED", "REJECTED"] : status === "ACCEPTED" ? ["PREPARING"] : status === "PREPARING" ? ["READY"] : status === "READY" ? ["COMPLETED"] : [];
}

export async function PATCH(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ error: "Database is required." }, { status: 503 });
  const body = await request.json() as { orderCode?: string; status?: string };
  if (!body.orderCode || !body.status) return NextResponse.json({ error: "Order and status are required." }, { status: 400 });
  const order = await prisma.order.findUnique({ where: { orderCode: body.orderCode }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (directStatuses.includes(order.status as DirectStatus)) {
    const actor = await prisma.user.findUnique({ where: { email: sessionEmail(request) } });
    if (!actor || actor.role !== "FARMER") return NextResponse.json({ error: "Only the selected farmer can update this order." }, { status: 403 });
    const farmerOwnsOrder = await prisma.orderItem.count({ where: { orderId: order.id, produce: { farmerId: actor.id } } });
    if (!farmerOwnsOrder) return NextResponse.json({ error: "This order does not include your produce." }, { status: 403 });
    if (!directStatuses.includes(body.status as DirectStatus) || !nextDirectStatuses(order.status as DirectStatus).includes(body.status as DirectStatus)) return NextResponse.json({ error: "That order status transition is not allowed." }, { status: 409 });
    const updated = await prisma.$transaction(async (tx) => {
      if (body.status === "REJECTED" && !order.inventoryRestored) {
        for (const item of order.items) {
          if (item.produceId) await tx.produce.update({ where: { id: item.produceId }, data: { quantityKg: { increment: item.quantityKg }, available: true } });
        }
        return tx.order.update({ where: { id: order.id }, data: { status: "REJECTED", inventoryRestored: true } });
      }
      return tx.order.update({ where: { id: order.id }, data: { status: body.status as DirectStatus } });
    }, { timeout: 15000 });
    return NextResponse.json({ order: updated });
  }
  if (!workflowStatuses.includes(body.status as WorkflowStatus) || !workflowStatuses.includes(order.status as WorkflowStatus)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  const updated = await prisma.order.update({ where: { id: order.id }, data: { status: body.status as WorkflowStatus } });
  return NextResponse.json({ order: updated });
}
