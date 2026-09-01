"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Tool } from "@/lib/types";
import { ToolCard } from "@/components/tool-card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/dashboard/ui";

export function ToolsSearchGrid({ tools, savedIds }: { tools: Tool[]; savedIds?: string[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return tools;
    const l = q.toLowerCase();
    return tools.filter((t) => t.name.toLowerCase().includes(l) || t.description.toLowerCase().includes(l) || (t.categoryName || "").toLowerCase().includes(l));
  }, [q, tools]);

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your tools…" className="pl-9" />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No tools found" description="Try a different search." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => <ToolCard key={t.slug} tool={t} savedInitial={savedIds?.includes(t.id)} />)}
        </div>
      )}
    </div>
  );
}
