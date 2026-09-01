import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run, insert, remove } from "@/lib/db";
import { getAutomations } from "@/lib/data";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ automations: getAutomations(session.user.id) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const id = crypto.randomUUID();
  insert("Automation", {
    userId: session.user.id, name: b.name, description: b.description || "",
    active: b.active === false ? 0 : 1, runs: 0, createdAt: new Date().toISOString(),
  }, id);
  const triggers: string[] = Array.isArray(b.triggers) ? b.triggers : [];
  const actions: string[] = Array.isArray(b.actions) ? b.actions : [];
  triggers.forEach((t, i) => insert("AutomationTrigger", { automationId: id, type: t, value: "", order: i }));
  actions.forEach((a, i) => insert("AutomationAction", { automationId: id, type: a, value: "", order: i }));
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const existing = get(`SELECT id FROM "Automation" WHERE id = ? AND userId = ?`, [b.id, session.user.id]);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  run(`UPDATE "Automation" SET active = ?, name = ? WHERE id = ?`, [b.active === false ? 0 : 1, b.name || b.id, b.id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  remove("Automation", b.id);
  return NextResponse.json({ ok: true });
}
