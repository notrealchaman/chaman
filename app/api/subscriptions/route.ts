import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run, insert, remove } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const subs = await import("@/lib/data").then((m) => m.getSubscriptions(session.user.id));
  return NextResponse.json({ subscriptions: subs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const id = crypto.randomUUID();
  insert("Subscription", {
    userId: session.user.id,
    name: b.name,
    logo: b.logo || b.name?.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "",
    color: b.color || "#22c55e",
    priceMonthly: Number(b.priceMonthly || 0),
    priceYearly: Number(b.priceYearly || 0),
    billingCycle: b.billingCycle || "MONTHLY",
    renewalDate: b.renewalDate || null,
    category: b.category || "Productivity",
    active: 1,
    createdAt: new Date().toISOString(),
  }, id);
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const existing = get(`SELECT id FROM "Subscription" WHERE id = ? AND userId = ?`, [b.id, session.user.id]);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  run(`UPDATE "Subscription" SET name = ?, logo = ?, color = ?, priceMonthly = ?, priceYearly = ?, billingCycle = ?, renewalDate = ?, category = ? WHERE id = ?`,
    [b.name, b.logo || "", b.color || "#22c55e", Number(b.priceMonthly || 0), Number(b.priceYearly || 0), b.billingCycle || "MONTHLY", b.renewalDate || null, b.category || "Productivity", b.id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const existing = get(`SELECT id FROM "Subscription" WHERE id = ? AND userId = ?`, [b.id, session.user.id]);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  remove("Subscription", b.id);
  return NextResponse.json({ ok: true });
}
