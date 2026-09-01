"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Tag, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { ToolIcon } from "@/components/shared/tool-icon";
import { cn } from "@/lib/utils";

interface Result {
  slug: string;
  name: string;
  tagline: string;
  categoryName: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  logo: string;
  color: string;
}

export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [tools, setTools] = useState<Result[]>([]);
  const [cats, setCats] = useState<{ slug: string; name: string }[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQ("");
      setTools([]);
      setCats([]);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!q.trim()) {
      setTools([]);
      setCats([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setTools(data.tools || []);
        setCats(data.categories || []);
        setActive(0);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const total = tools.length + cats.length;

  const goto = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(total - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (active < cats.length) {
        goto(`/categories/${cats[active].slug}`);
      } else {
        const idx = active - cats.length;
        if (tools[idx]) goto(`/tools/${tools[idx].slug}`);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl gap-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">Search PEAKLOOP</DialogTitle>
        <DialogDescription className="sr-only">Search tools, categories and more</DialogDescription>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search tools, categories, deals…"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <kbd className="hidden sm:block rounded border border-border bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">ESC</kbd>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {q.trim() === "" ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              Try searching for “CRM”, “AI”, or “project management”.
            </div>
          ) : (
            <>
              {cats.length > 0 && (
                <div className="mb-1">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</div>
                  {cats.map((c, i) => (
                    <button
                      key={c.slug}
                      onClick={() => goto(`/categories/${c.slug}`)}
                      className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50", active === i && "bg-slate-100")}
                    >
                      <Tag className="h-4 w-4 text-pl-sky" />
                      <span className="font-medium">{c.name}</span>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
              {tools.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tools</div>
                  {tools.map((t, i) => (
                    <button
                      key={t.slug}
                      onClick={() => goto(`/tools/${t.slug}`)}
                      className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50", active === cats.length + i && "bg-slate-100")}
                    >
                      <ToolIcon name={t.name} logo={t.logo} color={t.color} size="sm" />
                      <span className="flex-1 min-w-0">
                        <span className="block truncate font-medium">{t.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{t.tagline}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{t.rating.toFixed(1)} ★</span>
                    </button>
                  ))}
                </div>
              )}
              {total === 0 && !loading && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results for “{q}”. Try a different search.
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border bg-slate-50 px-4 py-2 text-xs text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
