import { NextResponse } from "next/server";
import { prisma, databaseConfigured } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status ?? "");
  const allowed = ["OPEN", "CREATED", "MATCHED", "POOL_CREATED", "COLLECTION", "CONSOLIDATION", "DISPATCHED", "DELIVERED", "COMPLETED"];
  if (!allowed.includes(status)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  if (databaseConfigured()) {
    const order = await prisma.order.update({ where: { id }, data: { status: status as never } });
    return NextResponse.json({ order });
  }
  return NextResponse.json({ order: { id, status }, source: "demo-fallback" });
}
