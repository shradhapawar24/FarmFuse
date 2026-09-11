import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status ?? "");
  const allowed = ["PENDING", "ACCEPTED", "REJECTED", "PREPARING", "READY", "COMPLETED", "ORDER_PLACED", "MATCHED", "COLLECTION", "COLLECTION_POINT", "CONSOLIDATION", "DISPATCHED", "DELIVERED"];
  if (!allowed.includes(status)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ error: "Database is required." }, { status: 503 });
  const order = await prisma.order.update({ where: { id }, data: { status: status as "PENDING" | "ACCEPTED" | "REJECTED" | "PREPARING" | "READY" | "COMPLETED" | "ORDER_PLACED" | "MATCHED" | "COLLECTION" | "COLLECTION_POINT" | "CONSOLIDATION" | "DISPATCHED" | "DELIVERED" } });
  return NextResponse.json({ order });
}
