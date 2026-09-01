import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run, insert } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { toolId, rating, title, content, pros, cons, useCase, companySize } = body;
  if (!toolId || !rating || !title || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  // prevent duplicate review from same user for same tool
  const dup = get(`SELECT id FROM "Review" WHERE userId = ? AND toolId = ?`, [session.user.id, toolId]);
  if (dup) return NextResponse.json({ error: "You already reviewed this tool" }, { status: 409 });

  const id = crypto.randomUUID();
  insert("Review", {
    userId: session.user.id,
    toolId,
    rating: Math.max(1, Math.min(5, Number(rating))),
    title: String(title),
    content: String(content),
    pros: JSON.stringify(pros || []),
    cons: JSON.stringify(cons || []),
    useCase: String(useCase || ""),
    companySize: String(companySize || ""),
    verificationType: session.user.accountType === "BUSINESS" ? "Business User" : "Verified User",
    verified: 1,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  }, id);

  return NextResponse.json({ ok: true, id, message: "Review submitted for moderation." });
}
