import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run, insert } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const id = crypto.randomUUID();
  insert("CRMDeal", {
    userId: session.user.id, title: b.title, stage: b.stage || "Lead", value: Number(b.value || 0),
    contact: b.contact || "", probability: Number(b.probability || 50), owner: b.owner || session.user.name || "",
    notes: b.notes || "", closeDate: b.closeDate || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }, id);
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const existing = get(`SELECT id FROM "CRMDeal" WHERE id = ? AND userId = ?`, [b.id, session.user.id]);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  run(`UPDATE "CRMDeal" SET stage = ?, updatedAt = ? WHERE id = ?`, [b.stage, new Date().toISOString(), b.id]);
  return NextResponse.json({ ok: true });
}
