import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma, databaseConfigured } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    if (!databaseConfigured()) return NextResponse.json({ error: "Account sign-in is unavailable until the database is configured." }, { status: 503 });
    const stored = await prisma.user.findUnique({ where: { email } });
    if (!stored || !(await compare(password, stored.passwordHash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const user = { email, role: stored.role.toLowerCase(), name: stored.name };
    const response = NextResponse.json({ user });
    response.cookies.set("farmfuse_session", JSON.stringify(user), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
