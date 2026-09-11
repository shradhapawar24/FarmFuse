import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/prisma";

type MatchItem = {
  crop: string;
  required: number;
  matched: number;
  selected: Array<{ id: string; contribution: number; price: number }>;
};

function sessionEmail(request: Request) {
  const cookie = request.headers.get("cookie")?.match(/farmfuse_session=([^;]+)/)?.[1];
  if (!cookie) return "";
  try {
    return JSON.parse(decodeURIComponent(cookie)).email ?? "";
  } catch {
    return "";
  }
}

function trackingId() {
  return `FF-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    if (!databaseConfigured()) return NextResponse.json({ error: "Database is required to create a Farm Pool." }, { status: 503 });
    const body = await request.json() as { items?: MatchItem[]; deliveryLocation?: string; deliveryDate?: string };
    const items = body.items ?? [];
    const buyer = await prisma.user.findUnique({ where: { email: sessionEmail(request) } });
    if (!buyer || buyer.role !== "BUYER") return NextResponse.json({ error: "Sign in as a buyer to create a Farm Pool." }, { status: 401 });
    if (!items.length || items.some((item) => item.required <= 0 || item.matched <= 0 || !item.selected.length)) return NextResponse.json({ error: "A Farm Pool needs a valid matched selection for every vegetable." }, { status: 400 });

    const selectedIds = items.flatMap((item) => item.selected.map((entry) => entry.id));
    const produce = await prisma.produce.findMany({ where: { id: { in: selectedIds }, available: true } });
    const produceById = new Map(produce.map((entry) => [entry.id, entry]));
    for (const item of items) for (const entry of item.selected) {
      const listing = produceById.get(entry.id);
      if (!listing || entry.contribution <= 0 || entry.contribution > listing.quantityKg) return NextResponse.json({ error: "Matching changed. Run Smart Matching again before creating the pool." }, { status: 409 });
    }

    const total = items.reduce((sum, item) => sum + item.matched, 0);
    const averagePrice = items.reduce((sum, item) => sum + item.selected.reduce((sub, entry) => sub + entry.price * entry.contribution, 0), 0) / total;
    const first = items[0];
    const code = trackingId();
    const result = await prisma.$transaction(async (tx) => {
      const bulkOrder = await tx.bulkOrder.create({
        data: {
          buyerId: buyer.id,
          crop: first.crop,
          requiredQuantityKg: first.required,
          maximumPricePerKg: Math.max(...items.flatMap((item) => item.selected.map((entry) => entry.price))),
          deliveryLocation: body.deliveryLocation?.trim() || "Collection hub",
          deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : new Date(Date.now() + 7 * 86400000),
          status: "ORDER_PLACED",
          items: { create: items.map((item) => ({ crop: item.crop, requiredQuantityKg: item.required })) },
        },
      });
      const pool = await tx.farmPool.create({
        data: {
          poolCode: code,
          bulkOrderId: bulkOrder.id,
          buyerId: buyer.id,
          matchedQuantityKg: total,
          averagePricePerKg: averagePrice,
          status: "FULFILLED",
          members: { create: items.flatMap((item) => item.selected.map((entry) => ({ produceId: entry.id, contributionKg: entry.contribution }))) },
        },
      });
      const order = await tx.order.create({
        data: {
          orderCode: code,
          buyerId: buyer.id,
          farmPoolId: pool.id,
          status: "POOL_CREATED",
          items: { create: items.map((item) => ({ crop: item.crop, quantityKg: item.matched, pricePerKg: item.selected.reduce((sum, entry) => sum + entry.price * entry.contribution, 0) / item.matched })) },
        },
        include: { farmPool: { include: { bulkOrder: { include: { items: true } }, members: { include: { produce: { include: { farmer: true } } } } } }, items: true },
      });
      for (const [id, listing] of produceById) {
        const reserved = items.flatMap((item) => item.selected).filter((entry) => entry.id === id).reduce((sum, entry) => sum + entry.contribution, 0);
        await tx.produce.update({ where: { id }, data: { quantityKg: listing.quantityKg - reserved, available: listing.quantityKg - reserved > 0 } });
      }
      return { pool, order };
    }, { timeout: 15000 });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Farm Pool transaction failed", error);
    return NextResponse.json({ error: "Could not create the Farm Pool. Matching may have changed; try again." }, { status: 500 });
  }
}
