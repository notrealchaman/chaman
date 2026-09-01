import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ saved: [] });
  const row = get<{ ids: string | null }>(`SELECT GROUP_CONCAT(toolId, ',') as ids FROM "Favorite" WHERE userId = ?`, [session.user.id]);
  return NextResponse.json({ saved: row?.ids ? String(row.ids).split(",") : [] });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized", message: "You must be logged in to save tools." }, { status: 401 });
  }
  const body = await req.json();
  const toolId = body.toolId as string;
  if (!toolId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const existing = get(`SELECT id FROM "Favorite" WHERE userId = ? AND toolId = ?`, [session.user.id, toolId]);
  if (existing) {
    run(`DELETE FROM "Favorite" WHERE userId = ? AND toolId = ?`, [session.user.id, toolId]);
    return NextResponse.json({ saved: false });
  }
  run(`INSERT INTO "Favorite" (id, userId, toolId, createdAt) VALUES (?, ?, ?, ?)`, [crypto.randomUUID(), session.user.id, toolId, new Date().toISOString()]);
  return NextResponse.json({ saved: true });
}
