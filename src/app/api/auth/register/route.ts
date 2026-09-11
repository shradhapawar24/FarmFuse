import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma, databaseConfigured } from "@/lib/prisma";

function safeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/([a-z][a-z0-9+.-]*:\/\/)[^\s"']+/gi, "$1[REDACTED_URL]")
    .replace(/(password|passwd|secret|token|api[_-]?key|access[_-]?key)(\s*[:=]\s*)[^\s,;}]+/gi, "$1$2[REDACTED]")
    .slice(0, 1000);
}
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta.target.map(String) : [];
      if (target.includes("email")) {
        return NextResponse.json({ error: "An account with this email is already registered." }, { status: 409 });
      }
    }

    console.error("[auth/register] Registration failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
      message: safeErrorMessage(error),
      databaseUrlPresent: Boolean(process.env.DATABASE_URL),
      prismaClientVersion: Prisma.prismaVersion.client,
    });
    return NextResponse.json({ error: "Unable to create the account right now." }, { status: 500 });
  }
}

