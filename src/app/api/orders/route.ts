import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const crop = String(body.crop ?? "").trim();
    const quantity = Number(body.quantity);
    const maximumPrice = Number(body.maximumPrice);
    const deliveryLocation = String(body.deliveryLocation ?? "").trim();
    const deliveryDate = new Date(body.deliveryDate);
    if (!crop || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(maximumPrice) || maximumPrice <= 0 || !deliveryLocation || Number.isNaN(deliveryDate.getTime())) return NextResponse.json({ error: "Complete the crop, quantity, price, location, and delivery date." }, { status: 400 });
    if (!databaseConfigured()) return NextResponse.json({ order: { id: `BO-${Date.now()}`, crop, requiredQuantity: quantity, status: "OPEN" }, source: "demo-fallback" }, { status: 201 });
    const buyer = await prisma.user.findUnique({ where: { email: "buyer@farmfuse.demo" } });
    if (!buyer) return NextResponse.json({ error: "Demo buyer account is not seeded." }, { status: 503 });
    const order = await prisma.bulkOrder.create({ data: { buyerId: buyer.id, crop, requiredQuantityKg: quantity, maximumPricePerKg: maximumPrice, deliveryLocation, deliveryDate } });
    return NextResponse.json({ order, source: "database" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create bulk order." }, { status: 500 });
  }
}
