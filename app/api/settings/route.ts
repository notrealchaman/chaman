import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { run, get } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = get(`SELECT id, name, email, image, role, accountType FROM "User" WHERE id = ?`, [session.user.id]);
  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  run(`UPDATE "User" SET name = ?, image = ? WHERE id = ?`, [b.name || session.user.name, b.image || session.user.image || null, session.user.id]);
  return NextResponse.json({ ok: true });
}
