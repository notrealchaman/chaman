"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Check, X, Minus, ArrowRight, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolIcon } from "@/components/shared/tool-icon";
import { useCompare } from "@/components/compare-provider";
import { toast } from "sonner";
import type { Tool } from "@/lib/types";

const rows: { label: string; values: (boolean | string)[] }[] = [
  { label: "Free plan", values: [true, true, false] },
  { label: "AI features", values: [true, true, true] },
  { label: "Email marketing", values: [false, true, true] },
  { label: "Automation", values: [true, true, true] },
  { label: "API access", values: [false, true, true] },
  { label: "Rating", values: ["4.8", "4.4", "4.2"] },
];

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === "string") return <span className="text-sm font-medium">{v}</span>;
  if (v) return <Check className="mx-auto h-4 w-4 text-[#16a34a]" />;
  return <Minus className="mx-auto h-4 w-4 text-slate-300" />;
}

export function ComparePromo() {
  const { slugs } = useCompare();
  const demo: Pick<Tool, "slug" | "name" | "logo" | "color">[] = useMemo(
    () => [
      { slug: "peak-crm", name: "PEAK CRM", logo: "PC", color: "#22c55e" },
      { slug: "hubspot", name: "HubSpot", logo: "HS", color: "#ff7a59" },
      { slug: "salesforce", name: "Salesforce", logo: "SF", color: "#00a1e0" },
    ],
    []
  );
  const cols = (slugs.length ? [demo[0], demo[1], demo[2]].slice(0, Math.max(2, slugs.length)) : demo).slice(0, 4);

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#16a34a]">
            <GitCompareArrows className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Compare tools side by side</h3>
            <p className="text-sm text-muted-foreground">Put {cols.length} tools head-to-head and see which wins.</p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/compare">Open Compare <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr>
              <th className="w-2/5 text-left text-sm text-muted-foreground font-medium">Feature</th>
              {cols.map((c) => (
                <th key={c.slug} className="w-1/5 text-center">
                  <Link href={`/tools/${c.slug}`} className="inline-flex flex-col items-center gap-1.5">
                    <ToolIcon name={c.name} logo={c.logo} color={c.color} size="md" />
                    <span className="text-xs font-medium">{c.name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <td className="py-3 text-sm text-slate-600">{row.label}</td>
                {row.values.slice(0, cols.length).map((v, i) => (
                  <td key={i} className="py-3 text-center"><Cell v={v} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Tip: pick up to 4 tools with the compare button on any tool card and build your own table.
      </p>
    </div>
  );
}
