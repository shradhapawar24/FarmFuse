import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma, databaseConfigured } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    if (!databaseConfigured()) return NextResponse.json({ error: "Account creation is unavailable until the database is configured." }, { status: 503 });
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const name = String(body.name ?? "").trim();
    const role = String(body.role ?? "BUYER").toUpperCase();
    const location = String(body.location ?? "").trim();
    if (!email || !name || password.length < 8 || !location || !["BUYER", "FARMER"].includes(role)) return NextResponse.json({ error: "Enter a name, valid location, email, and password of at least 8 characters." }, { status: 400 });
    const passwordHash = await hash(password, 10);
    const user = await prisma.user.create({ data: role === "FARMER" ? { email, name, passwordHash, role: "FARMER", farmerProfile: { create: { location } } } : { email, name, passwordHash, role: "BUYER", buyerProfile: { create: { companyName: name, location } } } });
    const response = NextResponse.json({ user: { email: user.email, name: user.name, role: role.toLowerCase() } }, { status: 201 });
    response.cookies.set("farmfuse_session", JSON.stringify({ email: user.email, name: user.name, role: role.toLowerCase() }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
    return response;
  } catch {
    return NextResponse.json({ error: "Could not create the account. The email may already be registered." }, { status: 409 });
  }
}