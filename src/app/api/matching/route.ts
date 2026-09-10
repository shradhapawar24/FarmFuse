import { NextResponse } from "next/server";
import { demoProduce, matchProduce } from "@/lib/demo-data";
import { prisma, databaseConfigured } from "@/lib/prisma";

export async function GET(request: Request) {
  const quantity = Number(new URL(request.url).searchParams.get("quantity") ?? 1000);
  if (!Number.isFinite(quantity) || quantity <= 0) return NextResponse.json({ error: "Quantity must be greater than zero." }, { status: 400 });

  let supply = demoProduce;
  if (databaseConfigured()) {
    const stored = await prisma.produce.findMany({ where: { available: true, crop: { equals: "Tomato", mode: "insensitive" } }, include: { farmer: true }, orderBy: { createdAt: "asc" } });
    if (stored.length) supply = stored.map((item) => ({ id: item.id, farmerId: item.farmerId, name: item.farmer.name, location: item.location, crop: item.crop, quantity: item.quantityKg, price: item.pricePerKg, color: "#77a85d" }));
  }
  const selected = matchProduce(quantity, supply);
  const matched = selected.reduce((total, item) => total + item.contribution, 0);
  return NextResponse.json({ selected, matched, remaining: Math.max(quantity - matched, 0), fulfillment: Math.round((matched / quantity) * 100), source: databaseConfigured() ? "database" : "demo-fallback" });
}
