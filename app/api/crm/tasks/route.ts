import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run, insert } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const id = crypto.randomUUID();
  insert("CRMTask", { userId: session.user.id, title: b.title, type: b.type || "TASK", done: 0, due: b.due || null, relatedTo: b.relatedTo || "", createdAt: new Date().toISOString() }, id);
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const existing = get(`SELECT id FROM "CRMTask" WHERE id = ? AND userId = ?`, [b.id, session.user.id]);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  run(`UPDATE "CRMTask" SET done = ?, title = ? WHERE id = ?`, [b.done ? 1 : 0, b.title, b.id]);
  return NextResponse.json({ ok: true });
}
