import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run, insert, remove } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { getTeamMembers } = await import("@/lib/data");
  return NextResponse.json({ members: getTeamMembers(session.user.id) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (!b.email || !b.role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // find an org the current user belongs to
  const org = get<{ organizationId: string }>(`SELECT organizationId FROM "TeamMember" WHERE userId = ? LIMIT 1`, [session.user.id]);
  if (!org) return NextResponse.json({ error: "No organization found. Set up your business first." }, { status: 400 });

  // find or create user by email
  const user = get<{ id: string }>(`SELECT id FROM "User" WHERE email = ?`, [b.email.toLowerCase()]);
  let userId = user?.id;
  if (!userId) {
    userId = crypto.randomUUID();
    insert("User", { name: b.email.split("@")[0], email: b.email.toLowerCase(), role: "USER", accountType: "PERSONAL" }, userId);
  }
  const existing = get(`SELECT id FROM "TeamMember" WHERE organizationId = ? AND userId = ?`, [org.organizationId, userId]);
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });
  insert("TeamMember", {
    organizationId: org.organizationId, userId, role: b.role, status: "INVITED",
    permissions: JSON.stringify({ crm: ["view"], orders: ["view"], analytics: ["view"] }),
    invitedAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true, userId });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  if (b.id && b.role) run(`UPDATE "TeamMember" SET role = ? WHERE id = ?`, [b.role, b.id]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  remove("TeamMember", b.id);
  return NextResponse.json({ ok: true });
}
