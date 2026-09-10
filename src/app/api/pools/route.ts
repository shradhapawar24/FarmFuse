import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const quantity = Number(body.quantity);
    const matched = Number(body.matched);
    const averagePrice = Number(body.averagePrice);
    const bulkOrderId = typeof body.bulkOrderId === "string" ? body.bulkOrderId : "";
    const selected = Array.isArray(body.selected) ? body.selected : [];
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(matched) || matched < 0 || !selected.length) return NextResponse.json({ error: "A valid matched supply selection is required." }, { status: 400 });
    if (!databaseConfigured()) return NextResponse.json({ pool: { id: `FP-${Date.now()}`, required: quantity, matched, farmers: selected.length, status: matched >= quantity ? "FULFILLED" : "MATCHING" }, source: "demo-fallback" }, { status: 201 });
    const buyer = await prisma.user.findUnique({ where: { email: "buyer@farmfuse.demo" } });
    if (!buyer) return NextResponse.json({ error: "Demo buyer account is not seeded." }, { status: 503 });
    const bulkOrder = bulkOrderId
      ? await prisma.bulkOrder.update({ where: { id: bulkOrderId }, data: { status: "POOL_CREATED" } })
      : await prisma.bulkOrder.create({ data: { buyerId: buyer.id, crop: "Tomato", requiredQuantityKg: quantity, maximumPricePerKg: 32, deliveryLocation: "Dhule", deliveryDate: new Date(Date.now() + 7 * 86400000), status: "POOL_CREATED" } });
    const pool = await prisma.farmPool.create({ data: { poolCode: `FP-${Date.now()}`, bulkOrderId: bulkOrder.id, buyerId: buyer.id, matchedQuantityKg: matched, averagePricePerKg: averagePrice, status: matched >= quantity ? "FULFILLED" : "MATCHING", members: { create: selected.map((item: { id: string; contribution: number }) => ({ produceId: item.id, contributionKg: item.contribution })) } }, include: { members: true } });
    const order = await prisma.order.create({ data: { orderCode: `BO-${Date.now()}`, buyerId: buyer.id, farmPoolId: pool.id, status: "POOL_CREATED", items: { create: { crop: "Tomato", quantityKg: matched, pricePerKg: averagePrice } } } });
    return NextResponse.json({ pool, order, source: "database" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create the Farm Pool. Check that the database has been migrated and seeded." }, { status: 500 });
  }
}
