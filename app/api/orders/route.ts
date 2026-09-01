import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run, insert } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const id = crypto.randomUUID();
  insert("Order", {
    userId: session.user.id, customer: b.customer || "Instagram customer", status: b.status || "PAID",
    total: Number(b.total || 0), channel: b.channel || "Instagram", paymentStatus: b.paymentStatus || "PAID",
    items: JSON.stringify(b.items || []), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }, id);
  // create a customer + notification for the flow
  if (b.customer && !b.noCustomer) {
    const cid = crypto.randomUUID();
    insert("Customer", { userId: session.user.id, name: b.customer, email: b.customer.toLowerCase().replace(/\s+/g, "") + "@gmail.com", phone: "", channel: b.channel || "Instagram", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, cid);
  }
  insert("Notification", { userId: session.user.id, title: "New order", body: `${b.customer || "a customer"} placed an order via ${b.channel || "Instagram"}.`, type: "ORDER", link: "/dashboard/orders", read: 0, createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const existing = get(`SELECT id FROM "Order" WHERE id = ? AND userId = ?`, [b.id, session.user.id]);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  run(`UPDATE "Order" SET status = ?, paymentStatus = ?, updatedAt = ? WHERE id = ?`, [b.status, b.paymentStatus || b.status, new Date().toISOString(), b.id]);
  return NextResponse.json({ ok: true });
}
