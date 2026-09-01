"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolIcon } from "@/components/shared/tool-icon";
import type { Tool } from "@/lib/types";

const budgets = ["Under $10/mo", "$10–25/mo", "$25–49/mo", "$50+/mo"];
const sizes = ["1-10 people", "11-50 people", "51-200 people", "200+ people"];
const industries = ["Software & SaaS", "Marketing", "E-commerce", "Finance", "Retail", "Education"];

export function AiRecommend() {
  const [budget, setBudget] = useState(budgets[0]);
  const [size, setSize] = useState(sizes[0]);
  const [industry, setIndustry] = useState(industries[0]);
  const [result, setResult] = useState<{ recommendations: Tool[]; explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function recommend() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget, size, industry }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-white to-[#f0fdf4] p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold">AI Software Recommender</h3>
          <p className="text-sm text-muted-foreground">Tell us about your team and get tailored recommendations.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Budget</span>
          <Select value={budget} onValueChange={setBudget}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {budgets.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Team size</span>
          <Select value={size} onValueChange={setSize}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Industry</span>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
      </div>

      <Button onClick={recommend} disabled={loading} className="mt-5">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Analyzing…" : "Get my recommendations"}
      </Button>

      {result && (
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">{result.explanation}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {result.recommendations.map((t, i) => (
              <Link key={t.slug} href={`/tools/${t.slug}`} className="flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:border-[#bbf7d0]">
                <ToolIcon name={t.name} logo={t.logo} color={t.color} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{t.name}</span>
                    {i === 0 && <span className="rounded bg-[#ecfdf5] px-1.5 py-0.5 text-[10px] font-bold text-[#047857]">TOP</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">from {t.startingPrice === 0 ? "Free" : `$${(t.startingPrice / 100).toFixed(2)}/mo`}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
