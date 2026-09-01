import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { getNotifications } = await import("@/lib/data");
  return NextResponse.json({ notifications: getNotifications(session.user.id, 50) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (b.id) {
    const row = get(`SELECT id FROM "Notification" WHERE id = ? AND userId = ?`, [b.id, session.user.id]);
    if (row) run(`UPDATE "Notification" SET read = 1 WHERE id = ?`, [b.id]);
  } else {
    run(`UPDATE "Notification" SET read = 1 WHERE userId = ?`, [session.user.id]);
  }
  return NextResponse.json({ ok: true });
}
