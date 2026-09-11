import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const items = (Array.isArray(body.items) ? body.items : []) as Array<{ crop: string; quantity: number }>;
  if (!items.length || items.some((item: { crop?: string; quantity?: number }) => !item.crop || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0)) return NextResponse.json({ error: "Add at least one valid vegetable requirement." }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ error: "Database is required for matching." }, { status: 503 });
  const crops: string[] = [...new Set(items.map((item) => item.crop))];
  const supply = await prisma.produce.findMany({ where: { available: true, crop: { in: crops, mode: "insensitive" } }, include: { farmer: true }, orderBy: [{ readyDate: "asc" }, { createdAt: "asc" }, { pricePerKg: "asc" }] });
  const result = items.map((item: { crop: string; quantity: number }) => {
    let remaining = Number(item.quantity);
    const selected = supply.filter((produce) => produce.crop.toLowerCase() === item.crop.toLowerCase()).flatMap((produce) => {
      if (remaining <= 0) return [];
      const contribution = Math.min(remaining, produce.quantityKg);
      remaining -= contribution;
      return [{ id: produce.id, farmerId: produce.farmerId, name: produce.farmer.name, crop: produce.crop, location: produce.location, quantity: produce.quantityKg, price: produce.pricePerKg, ready: produce.readyDate, contribution }];
    });
    const matched = selected.reduce((total, entry) => total + entry.contribution, 0);
    return { crop: item.crop, required: Number(item.quantity), matched, remaining: Math.max(Number(item.quantity) - matched, 0), fulfillment: Math.round((matched / Number(item.quantity)) * 100), selected };
  });
  return NextResponse.json({ items: result, source: "database" });
}
