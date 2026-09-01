"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function ToolsFilterSidebar({
  categories,
  active,
}: {
  categories: { slug: string; name: string; toolCount: number }[];
  active: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function build(paramsToSet: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(paramsToSet)) {
      if (v === undefined) next.delete(k);
      else next.set(k, v);
    }
    if (next.get("page")) next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  const priceOptions = [
    { id: "", label: "Any price" },
    { id: "free", label: "Free" },
    { id: "under20", label: "Under $20/mo" },
    { id: "up50", label: "Under $50/mo" },
  ];

  return (
    <aside className="space-y-6">
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Filters</h3>
          <button
            onClick={() => router.push(pathname)}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Category</h3>
        <div className="space-y-1">
          <Link href={pathname} className={cn("block rounded px-2 py-1.5 text-sm", !active.category ? "bg-[#ecfdf5] text-[#047857] font-medium" : "text-slate-600 hover:bg-slate-50")}>
            All categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/tools?category=${c.slug}`}
              className={cn("flex items-center justify-between rounded px-2 py-1.5 text-sm", active.category === c.slug ? "bg-[#ecfdf5] text-[#047857] font-medium" : "text-slate-600 hover:bg-slate-50")}
            >
              <span className="truncate">{c.name}</span>
              <span className="text-xs text-muted-foreground">{c.toolCount}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Price</h3>
        <div className="space-y-1">
          {priceOptions.map((p) => (
            <button key={p.id} onClick={() => build({ price: p.id || undefined })} className={cn("flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-left", active.price === p.id ? "bg-[#ecfdf5] text-[#047857] font-medium" : "text-slate-600 hover:bg-slate-50")}>
              <span className={cn("flex h-4 w-4 items-center justify-center rounded border", active.price === p.id ? "border-[#16a34a] bg-[#16a34a] text-white" : "border-slate-300")} aria-hidden>
                {active.price === p.id && "✓"}
              </span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Options</h3>
        <div className="space-y-1">
          {[
            { key: "freePlan", label: "Free plan available" },
            { key: "freeTrial", label: "Free trial" },
            { key: "ai", label: "AI-powered" },
          ].map((o) => (
            <button key={o.key} onClick={() => build({ [o.key]: active[o.key] === "1" ? undefined : "1" })} className={cn("flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-left", active[o.key] === "1" ? "bg-[#ecfdf5] text-[#047857] font-medium" : "text-slate-600 hover:bg-slate-50")}>
              <span className={cn("flex h-4 w-4 items-center justify-center rounded border", active[o.key] === "1" ? "border-[#16a34a] bg-[#16a34a] text-white" : "border-slate-300")} aria-hidden>
                {active[o.key] === "1" && "✓"}
              </span>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold">Minimum rating</h3>
        <div className="space-y-1">
          {[{ id: "", label: "Any rating" }, { id: "4", label: "4.0 & up" }, { id: "4.5", label: "4.5 & up" }].map((r) => (
            <button key={r.id} onClick={() => build({ minRating: r.id || undefined })} className={cn("flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-left", active.minRating === r.id ? "bg-[#ecfdf5] text-[#047857] font-medium" : "text-slate-600 hover:bg-slate-50")}>
              <span className={cn("flex h-4 w-4 items-center justify-center rounded-full border", active.minRating === r.id ? "border-[#16a34a] bg-[#16a34a]" : "border-slate-300")} aria-hidden>{active.minRating === r.id && <span className="h-2 w-2 rounded-full bg-white" />}</span>
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
