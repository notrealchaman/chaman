import { NextRequest, NextResponse } from "next/server";
import { searchToolResults, getCategories } from "@/lib/data";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  if (!q) return NextResponse.json({ tools: [], categories: [] });

  const tools = searchToolResults(q);
  const cats = getCategories().filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
  return NextResponse.json({ tools, categories: cats });
}
