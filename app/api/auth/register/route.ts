import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { get, run } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name || "").trim();
  const email = (body.email || "").trim().toLowerCase();
  const password = (body.password || "").toString();

  if (!name || !email || password.length < 8) {
    return NextResponse.json({ error: "Please provide a name, email and a password of at least 8 characters." }, { status: 400 });
  }
  const existing = get(`SELECT id FROM "User" WHERE email = ?`, [email]);
  if (existing) return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  run(`INSERT INTO "User" (id, name, email, passwordHash, role, accountType, emailVerified, createdAt) VALUES (?, ?, ?, ?, 'USER', 'PERSONAL', NULL, ?)`,
    [id, name, email, hash, new Date().toISOString()]);

  // Create a verification token (would be emailed in production)
  const token = crypto.randomUUID();
  run(`INSERT INTO "VerificationToken" (identifier, token, expires) VALUES (?, ?, ?)`, [email, token, new Date(Date.now() + 24 * 3600 * 1000).toISOString()]);

  return NextResponse.json({ ok: true, userId: id, token });
}
