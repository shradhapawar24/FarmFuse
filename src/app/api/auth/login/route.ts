import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma, databaseConfigured } from "@/lib/prisma";

const demoUsers = {
  "buyer@farmfuse.demo": { password: "FarmFuse123", role: "buyer", name: "Narmada Foods" },
  "farmer@farmfuse.demo": { password: "FarmFuse123", role: "farmer", name: "Arjun Patil" },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    let user = demoUsers[email as keyof typeof demoUsers];
    if (databaseConfigured()) {
      const stored = await prisma.user.findUnique({ where: { email } });
      if (stored && await compare(password, stored.passwordHash)) user = { password: "", role: stored.role.toLowerCase(), name: stored.name };
    }
    if (!user || (user.password && user.password !== password)) return NextResponse.json({ error: "Invalid demo credentials." }, { status: 401 });

    const response = NextResponse.json({ user: { email, role: user.role, name: user.name } });
    response.cookies.set("farmfuse_session", JSON.stringify({ email, role: user.role, name: user.name }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
