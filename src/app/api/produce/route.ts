import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/prisma";

function sessionEmail(request: Request) {
  const cookie = request.headers.get("cookie")?.match(/farmfuse_session=([^;]+)/)?.[1];
  if (!cookie) return "";
  try { return JSON.parse(decodeURIComponent(cookie)).email ?? ""; } catch { return ""; }
}

export async function GET(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ produce: [], source: "database-required" }, { status: 503 });
  const crop = new URL(request.url).searchParams.get("crop");
  const produce = await prisma.produce.findMany({
    where: { available: true, ...(crop ? { crop: { equals: crop, mode: "insensitive" } } : {}) },
    include: { farmer: true },
    orderBy: [{ crop: "asc" }, { pricePerKg: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ produce, source: "database" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const crop = String(body.crop ?? "Tomato").trim();
    const quantity = Number(body.quantity);
    const price = Number(body.price);
    if (!crop || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) return NextResponse.json({ error: "Enter a valid crop, quantity, and price." }, { status: 400 });
    if (!databaseConfigured()) return NextResponse.json({ error: "Database is required to publish produce." }, { status: 503 });
    const farmer = await prisma.user.findUnique({ where: { email: sessionEmail(request) }, include: { farmerProfile: true } });
    if (!farmer || farmer.role !== "FARMER") return NextResponse.json({ error: "Sign in as a farmer to publish produce." }, { status: 401 });
    const location = String(body.location ?? farmer.farmerProfile?.location ?? "").trim();
    const readyDate = body.ready ? new Date(String(body.ready)) : null;
    const produce = await prisma.produce.create({ data: { farmerId: farmer.id, crop, quantityKg: quantity, pricePerKg: price, location, readyDate: readyDate && !Number.isNaN(readyDate.getTime()) ? readyDate : null } });
    return NextResponse.json({ produce, source: "database" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save produce." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Produce id is required." }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ error: "Database is required." }, { status: 503 });
  const farmer = await prisma.user.findUnique({ where: { email: sessionEmail(request) } });
  const listing = await prisma.produce.findUnique({ where: { id } });
  if (!farmer || !listing || listing.farmerId !== farmer.id) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  await prisma.produce.update({ where: { id }, data: { available: false } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ error: "Database is required." }, { status: 503 });
  const body = await request.json();
  const id = String(body.id ?? "");
  const farmer = await prisma.user.findUnique({ where: { email: sessionEmail(request) } });
  const listing = await prisma.produce.findUnique({ where: { id } });
  if (!farmer || !listing || listing.farmerId !== farmer.id) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const quantity = body.quantity === undefined ? listing.quantityKg : Number(body.quantity);
  const price = body.price === undefined ? listing.pricePerKg : Number(body.price);
  if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) return NextResponse.json({ error: "Enter a valid quantity and price." }, { status: 400 });
  const produce = await prisma.produce.update({ where: { id }, data: { quantityKg: quantity, pricePerKg: price, available: body.available === undefined ? listing.available : Boolean(body.available) } });
  return NextResponse.json({ produce });
}
