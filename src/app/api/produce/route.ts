import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const crop = String(body.crop ?? "Tomato").trim();
    const quantity = Number(body.quantity);
    const price = Number(body.price);
    if (!crop || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) return NextResponse.json({ error: "Enter a valid crop, quantity, and price." }, { status: 400 });
    if (!databaseConfigured()) return NextResponse.json({ produce: { id: `demo-${Date.now()}`, name: "Your new listing", location: "Your farm", crop, quantity, price, color: "#9aa89a" }, source: "demo-fallback" }, { status: 201 });
    const farmer = await prisma.user.findUnique({ where: { email: "farmer@farmfuse.demo" } });
    if (!farmer) return NextResponse.json({ error: "Demo farmer account is not seeded." }, { status: 503 });
    const produce = await prisma.produce.create({ data: { farmerId: farmer.id, crop, quantityKg: quantity, pricePerKg: price, location: "Nashik, Maharashtra" } });
    return NextResponse.json({ produce, source: "database" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save produce." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Produce id is required." }, { status: 400 });
  if (databaseConfigured()) await prisma.produce.update({ where: { id }, data: { available: false } });
  return NextResponse.json({ ok: true });
}
