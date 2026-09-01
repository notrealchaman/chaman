import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run, insert, remove } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const id = crypto.randomUUID();
  insert("Product", { userId: session.user.id, name: b.name, sku: b.sku || "", price: Number(b.price || 0), cost: Number(b.cost || 0), stock: Number(b.stock || 0), category: b.category || "", image: b.image || "", createdAt: new Date().toISOString() }, id);
  return NextResponse.json({ ok: true, id });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const existing = get(`SELECT id FROM "Product" WHERE id = ? AND userId = ?`, [b.id, session.user.id]);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  run(`UPDATE "Product" SET name = ?, price = ?, cost = ?, stock = ?, category = ?, sku = ? WHERE id = ?`, [b.name, Number(b.price || 0), Number(b.cost || 0), Number(b.stock || 0), b.category || "", b.sku || "", b.id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  remove("Product", b.id);
  return NextResponse.json({ ok: true });
}
