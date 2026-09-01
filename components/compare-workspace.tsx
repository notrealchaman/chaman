"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Minus, X, ArrowRight, Sparkles, Loader2, Trash2 } from "lucide-react";
import { useCompare } from "@/components/compare-provider";
import { ToolIcon } from "@/components/shared/tool-icon";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tool } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

interface RowDef {
  key: string;
  label: string;
  get: (t: Tool) => boolean | string | number;
  highlight?: "max" | "min" | "bool";
}

const rows: RowDef[] = [
  { key: "rating", label: "Rating", get: (t) => t.rating.toFixed(1), highlight: "max" },
  { key: "reviewCount", label: "Reviews", get: (t) => t.reviewCount.toLocaleString(), highlight: "max" },
  { key: "startingPrice", label: "Monthly price", get: (t) => (t.startingPrice === 0 ? "Free" : `${formatMoney(t.startingPrice)}/mo`), highlight: "min" },
  { key: "freePlan", label: "Free plan", get: (t) => t.freePlan, highlight: "bool" },
  { key: "freeTrial", label: "Free trial", get: (t) => t.freeTrial, highlight: "bool" },
  { key: "aiPowered", label: "AI features", get: (t) => t.aiPowered, highlight: "bool" },
  { key: "automation", label: "Automation", get: (t) => t.features?.some((f) => /autom|workflow/i.test(f.name)) ?? false, highlight: "bool" },
  { key: "crm", label: "CRM", get: (t) => t.categorySlug === "sales-crm" || t.integrations.includes("HubSpot"), highlight: "bool" },
  { key: "integrations", label: "Integrations", get: (t) => t.integrations.length, highlight: "max" },
  { key: "api", label: "API", get: (t) => t.pricing?.some((p) => /api/i.test(p.features.join(" "))) ?? false, highlight: "bool" },
  { key: "team", label: "Team members", get: (t) => Math.max(...(t.pricing?.map((p) => p.users) || [1])), highlight: "max" },
  { key: "support", label: "Company size", get: (t) => t.companySize },
];

export function CompareWorkspace() {
  const { slugs, remove, clear } = useCompare();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState("Under $10/mo");
  const [size, setSize] = useState("1-10 people");
  const [industry, setIndustry] = useState("Software & SaaS");
  const [ai, setAi] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!slugs.length) { setTools([]); return; }
    setLoading(true);
    fetch(`/api/compare?slugs=${slugs.join(",")}`).then((r) => r.json()).then((d) => setTools(d.tools || [])).finally(() => setLoading(false));
  }, [slugs]);

  async function runAi() {
    setAiLoading(true);
    const res = await fetch("/api/ai/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ budget, size, industry }) });
    const data = await res.json();
    setAi(data.recommendations?.[0]?.name ? data.recommendations[0] : null);
    setAiLoading(false);
  }

  if (slugs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#16a34a]"><ArrowRight className="h-6 w-6" /></div>
        <h2 className="text-lg font-semibold">No tools selected</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use the compare button on any tool card to add tools here.</p>
        <Button asChild className="mt-5"><Link href="/tools">Browse tools</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {slugs.map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-sm">{s}
            <button onClick={() => remove(s)} aria-label={`Remove ${s}`} className="text-muted-foreground hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
          </span>
        ))}
        <button onClick={clear} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Trash2 className="h-4 w-4" /> Clear</button>
      </div>

      {loading ? <Loader2 className="mx-auto mt-10 h-6 w-6 animate-spin text-muted-foreground" /> : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-sm text-muted-foreground font-medium w-52">Feature</th>
                {tools.map((t) => (
                  <th key={t.slug} className="p-4 text-center">
                    <Link href={`/tools/${t.slug}`} className="inline-flex flex-col items-center gap-2">
                      <ToolIcon name={t.name} logo={t.logo} color={t.color} size="lg" />
                      <span className="text-sm font-semibold">{t.name}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const values = tools.map((t) => row.get(t));
                let winner: number[] = [];
                if (row.highlight === "max") {
                  const numeric = values.map((v) => typeof v === "number" ? v : parseFloat(String(v)) || 0);
                  const best = Math.max(...numeric);
                  winner = numeric.map((v, i) => (v === best && values.length > 1 ? i : -1)).filter((i) => i >= 0);
                } else if (row.highlight === "min") {
                  const numeric = values.map((v) => parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0);
                  const best = Math.min(...numeric);
                  winner = numeric.map((v, i) => (v === best && values.length > 1 ? i : -1)).filter((i) => i >= 0);
                } else if (row.highlight === "bool") {
                  winner = values.map((v, i) => (v === true ? i : -1)).filter((i) => i >= 0);
                }
                return (
                  <tr key={row.key} className="border-b border-border last:border-0">
                    <td className="p-4 text-sm text-slate-600">{row.label}</td>
                    {values.map((v, i) => (
                      <td key={i} className={`p-4 text-center ${winner.includes(i) ? "bg-[#f0fdf4]" : ""}`}>
                        {typeof v === "boolean" ? (v ? <Check className="mx-auto h-4 w-4 text-[#16a34a]" /> : <Minus className="mx-auto h-4 w-4 text-slate-300" />) : (
                          <span className={`text-sm ${winner.includes(i) ? "font-semibold text-[#047857]" : "text-slate-700"}`}>{v}</span>
                        )}
                        {winner.includes(i) && <span className="mt-1 block text-[10px] font-semibold text-[#16a34a]">✓ Best</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-border bg-gradient-to-br from-white to-[#f0fdf4] p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-white"><Sparkles className="h-5 w-5" /></span>
          <div>
            <h3 className="text-lg font-semibold">Which one is best for you?</h3>
            <p className="text-sm text-muted-foreground">Tell us about your business for a tailored recommendation.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[{ v: budget, s: setBudget, opts: ["Under $10/mo", "$10–25/mo", "$25–49/mo", "$50+/mo"] }, { v: size, s: setSize, opts: ["1-10 people", "11-50 people", "51-200 people", "200+ people"] }, { v: industry, s: setIndustry, opts: ["Software & SaaS", "Marketing", "E-commerce", "Finance"] }].map((c) => (
            <Select key={c.v} value={c.v} onValueChange={c.s}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{c.opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
          ))}
        </div>
        <Button onClick={runAi} disabled={aiLoading} className="mt-4">{aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Get tailored recommendation</Button>
        {ai && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4">
            <Sparkles className="h-5 w-5 text-[#16a34a]" />
            <div className="flex-1">
              <div className="text-sm font-semibold">Recommended: {ai}</div>
              <div className="text-xs text-muted-foreground">Based on your budget, team size and industry.</div>
            </div>
            <Link href={`/tools/${ai?.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm font-medium text-[#047857] hover:underline">View</Link>
          </div>
        )}
      </div>
    </div>
  );
}
