import { NextRequest, NextResponse } from "next/server";
import { getToolBySlug } from "@/lib/data";

export async function GET(req: NextRequest) {
  const slugs = (req.nextUrl.searchParams.get("slugs") || "").split(",").filter(Boolean).slice(0, 4);
  const tools = slugs.map((s) => getToolBySlug(s)).filter(Boolean);
  return NextResponse.json({ tools });
}
