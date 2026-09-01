import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { run, get } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const existing = get(`SELECT id FROM "SocialAccount" WHERE id = ? AND userId = ?`, [b.id, session.user.id]);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  run(`UPDATE "SocialAccount" SET connected = ? WHERE id = ?`, [b.connected ? 1 : 0, b.id]);
  return NextResponse.json({ ok: true });
}
