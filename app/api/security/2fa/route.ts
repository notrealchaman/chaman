import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { run } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  run(`UPDATE "User" SET twoFactorEnabled = ? WHERE id = ?`, [b.enabled ? 1 : 0, session.user.id]);
  return NextResponse.json({ ok: true, enabled: !!b.enabled });
}
