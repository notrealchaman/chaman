"use client";

import { useEffect, useState } from "react";
import { Zap, Loader2, Play } from "lucide-react";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { AutomationBuilder } from "@/components/dashboard/automation-builder";
import type { Automation } from "@/lib/types";

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/automations");
    const d = await res.json();
    setAutomations(d.automations || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const active = automations.filter((a) => a.active).length;
  const runs = automations.reduce((a, aut) => a + aut.runs, 0);

  return (
    <div>
      <PageHeader eyebrow="Automation" title="Automation Builder" description="Automate leads, orders, reviews and more." />
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Workflows" value={automations.length} icon={<Zap className="h-5 w-5" />} />
        <StatCard label="Active" value={active} icon={<Play className="h-5 w-5" />} accent="sky" />
        <StatCard label="Total runs" value={runs.toLocaleString()} icon={<Zap className="h-5 w-5" />} accent="amber" />
      </div>
      {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /> : <AutomationBuilder automations={automations} onRefresh={load} />}
    </div>
  );
}
