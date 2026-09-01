import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run, insert, remove } from "@/lib/db";
import { getAPIKeys } from "@/lib/data";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ keys: getAPIKeys(session.user.id) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const id = crypto.randomUUID();
  const radix = crypto.randomUUID().replace(/-/g, "").slice(0, 22);
  const prefix = "pl_live_";
  const key = prefix + radix;
  insert("APIKey", { userId: session.user.id, name: b.name, key, prefix, permissions: JSON.stringify(b.permissions || ["read:tools"]), revoked: 0, lastUsed: null, createdAt: new Date().toISOString() }, id);
  return NextResponse.json({ ok: true, id, key, prefix });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  remove("APIKey", b.id);
  return NextResponse.json({ ok: true });
}
