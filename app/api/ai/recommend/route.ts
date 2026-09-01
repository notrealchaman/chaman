import { NextRequest, NextResponse } from "next/server";
import { getTools } from "@/lib/data";
import type { Tool } from "@/lib/types";

// Keyword-based recommendation engine. This is the deterministic fallback used
// when no OpenAI-compatible key is configured. It can be upgraded to call an
// LLM by reading OPENAI_API_KEY / OPENAI_BASE_URL from env (never hard-coded).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const budget = (body.budget as string) || "Under $10/mo";
  const size = (body.size as string) || "1-10 people";
  const industry = (body.industry as string) || "Software & SaaS";

  const maxPrice =
    budget.includes("Under") ? 1000 :
    budget.includes("10") ? 2500 :
    budget.includes("25") ? 5000 :
    budget.includes("50") ? 9000 : 99999;

  const catMap: Record<string, string> = {
    "Software & SaaS": "developer-tools",
    "Marketing": "marketing",
    "E-commerce": "e-commerce",
    "Finance": "finance",
    "Retail": "e-commerce",
    "Education": "education",
  };
  const category = catMap[industry];

  const { tools } = getTools({ category, perPage: 20, sort: "recommended" });
  const filtered = tools.filter((t) => t.startingPrice <= maxPrice && (size.includes("200") || t.companySize !== "500+"));
  const top = filtered.slice(0, 3);
  const fallback = top.length ? top : getTools({ perPage: 3, sort: "recommended" }).tools;

  const explanation = `Based on your ${size} team, ${budget} budget and ${industry} industry, I found the best-matching tools. Each one balances price, integrations and the features you'll need to grow.`;

  return NextResponse.json({ recommendations: fallback.map(strip), explanation });
}

function strip(t: Tool): Tool {
  return { ...t, description: t.description.slice(0, 120) };
}
