import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { run, insert } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const accountType = body.accountType === "BUSINESS" ? "BUSINESS" : "PERSONAL";
  const { companyName, industry, teamSize, primaryGoal } = body;

  run(`UPDATE "User" SET accountType = ? WHERE id = ?`, [accountType, session.user.id]);

  if (accountType === "BUSINESS" && companyName) {
    const orgId = crypto.randomUUID();
    insert("Organization", { name: companyName, industry: industry || "", teamSize: teamSize || "1-10", primaryGoal: primaryGoal || "", createdAt: new Date().toISOString() }, orgId);
    insert("TeamMember", {
      organizationId: orgId, userId: session.user.id, role: "OWNER",
      permissions: JSON.stringify({ crm: ["view", "create", "edit", "delete"], orders: ["view", "create", "edit", "refund"], analytics: ["view"], support: ["view", "create", "edit"] }),
      status: "ACTIVE", invitedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ ok: true });
}
