"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, HeartOff, GitCompareArrows, ArrowUpRight, BadgeCheck, Sparkles } from "lucide-react";
import type { Tool } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";
import { ToolIcon } from "@/components/shared/tool-icon";
import { StarRating } from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { useCompare } from "@/components/compare-provider";
import { toast } from "sonner";

export function ToolCard({
  tool,
  savedInitial = false,
}: {
  tool: Tool;
  savedInitial?: boolean;
}) {
  const { data: session } = useSession();
  const { has, toggle } = useCompare();
  const router = useRouter();
  const [saved, setSaved] = useState(savedInitial);
  const [saving, setSaving] = useState(false);
  const comparing = has(tool.slug);

  async function onSave(e: React.MouseEvent) {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Sign in to save tools");
      router.push("/login");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: tool.id }),
      });
      const data = await res.json();
      if (data.saved !== undefined) {
        setSaved(data.saved);
        toast.success(data.saved ? "Saved to your tools" : "Removed from your tools");
      }
    } finally {
      setSaving(false);
    }
  }

  function onCompare(e: React.MouseEvent) {
    e.preventDefault();
    toggle(tool.slug);
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:border-[#bbf7d0] hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ToolIcon name={tool.name} logo={tool.logo} color={tool.color} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="truncate font-semibold text-foreground">{tool.name}</h3>
              {tool.verified && (
                <span className="inline-flex text-[#16a34a]" title="Verified">
                  <BadgeCheck className="h-4 w-4" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{tool.categoryName || "Tools"}</span>
              {tool.aiPowered && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
                  <Sparkles className="h-3 w-3" /> AI
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            disabled={saving}
            aria-label={saved ? "Remove from saved" : "Save tool"}
            className={cn(
              "rounded-lg p-1.5 transition-colors hover:bg-slate-100",
              saved ? "text-red-500" : "text-slate-400 hover:text-red-500"
            )}
          >
            {saved ? <Heart className="h-4 w-4 fill-current" /> : <HeartOff className="h-4 w-4" />}
          </button>
          <button
            onClick={onCompare}
            aria-label="Add to compare"
            title="Add to compare"
            className={cn(
              "rounded-lg p-1.5 transition-colors hover:bg-slate-100",
              comparing ? "text-[#16a34a]" : "text-slate-400 hover:text-[#16a34a]"
            )}
          >
            <GitCompareArrows className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tool.description}</p>

      <div className="mt-3">
        <StarRating rating={tool.rating} count={tool.reviewCount} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div>
          {tool.freePlan ? (
            <div className="text-sm font-semibold text-foreground">
              Free plan <span className="font-normal text-muted-foreground">available</span>
            </div>
          ) : (
            <div className="text-sm font-semibold text-foreground">
              {tool.startingPrice === 0 ? "Free" : `$${formatMoney(tool.startingPrice).replace("$", "")}/mo`}
              <span className="ml-1 text-xs font-normal text-muted-foreground">starting</span>
            </div>
          )}
          {tool.freeTrial && !tool.freePlan && (
            <div className="text-[11px] font-medium text-[#16a34a]">Free trial</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>View Tool</span>
          <span className={cn(buttonVariants({ size: "icon-sm" }), "hidden sm:inline-flex")} aria-label="Visit website">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
