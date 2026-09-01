"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Check, Clock } from "lucide-react";
import type { Deal } from "@/lib/types";
import { ToolIcon } from "@/components/shared/tool-icon";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function useCountdown(target: string | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const t = new Date(target).getTime();
    const tick = () => setLeft(Math.max(0, Math.round((t - Date.now()) / 1000)));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [target]);
  return left;
}

function fmt(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return { d, h, m, sec };
}

export function DealCard({ deal }: { deal: Deal }) {
  const left = useCountdown(deal.expiresAt);
  const [copied, setCopied] = useState(false);
  const t = left !== null ? fmt(left) : null;
  const savings = deal.originalPrice > deal.currentPrice ? Math.round((1 - deal.currentPrice / deal.originalPrice) * 100) : 0;

  async function copyCoupon() {
    try {
      await navigator.clipboard.writeText(deal.coupon);
      setCopied(true);
      toast.success("Coupon copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:border-[#bbf7d0] hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <ToolIcon name={deal.toolName || "Deal"} logo={deal.toolLogo} color={deal.toolColor} size="lg" />
          <div>
            <div className="font-semibold">{deal.title}</div>
            <div className="text-xs text-muted-foreground">{deal.category}</div>
          </div>
        </div>
        {deal.featured && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700">LIMITED</span>}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="rounded-xl bg-[#ecfdf5] px-3 py-2 text-2xl font-bold text-[#047857]">{deal.discount}</span>
      </div>
      <div className="mt-3 text-sm">
        <span className="text-muted-foreground line-through">${(deal.originalPrice / 100).toFixed(2)}/mo</span>{" "}
        <span className="text-lg font-bold text-[#0f172a]">${(deal.currentPrice / 100).toFixed(2)}/mo</span>
        <span className="ml-2 text-xs font-medium text-[#047857]">Save {savings}%</span>
      </div>
      <p className="mt-3 flex-1 text-sm text-muted-foreground">{deal.description}</p>

      {t && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {t.d > 0 && <span className="font-mono rounded bg-slate-100 px-1 py-0.5">{t.d}d</span>}
          <span className="font-mono rounded bg-slate-100 px-1 py-0.5">{String(t.h).padStart(2, "0")}h</span>
          <span className="font-mono rounded bg-slate-100 px-1 py-0.5">{String(t.m).padStart(2, "0")}m</span>
          <span className="font-mono rounded bg-slate-100 px-1 py-0.5">{String(t.sec).padStart(2, "0")}s</span>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <Button asChild size="sm" className="flex-1"><Link href={deal.url || "/deals"}>Get Deal</Link></Button>
        <Button size="sm" variant="outline" onClick={copyCoupon} className="flex-1">
          {copied ? <Check className="h-3.5 w-3.5 text-[#16a34a]" /> : <Copy className="h-3.5 w-3.5" />} {deal.coupon}
        </Button>
      </div>
    </div>
  );
}
