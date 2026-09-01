"use client";

import { useEffect, useState, useCallback } from "react";
import { Database, Users, Target, ListChecks } from "lucide-react";
import { PageHeader, StatCard, EmptyState } from "@/components/dashboard/ui";
import { PipelineBoard } from "@/components/dashboard/pipeline-board";
import { Loader2 } from "lucide-react";
import type { CRMDeal, CRMLead, CRMTask } from "@/lib/types";

export default function CrmPage() {
  const [deals, setDeals] = useState<CRMDeal[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const d = await fetch("/api/crm").then((r) => r.json());
    setDeals(d.deals || []);
    setLeads(d.leads || []);
    setTasks(d.tasks || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function refresh() {
    const d = await fetch("/api/crm").then((r) => r.json());
    setDeals(d.deals || []); setLeads(d.leads || []); setTasks(d.tasks || []);
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <PageHeader eyebrow="PEAK CRM" title="Sales Pipeline" description="Manage leads, deals and tasks in one workspace." />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Deals" value={deals.length} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Leads" value={leads.length} icon={<Users className="h-5 w-5" />} accent="sky" />
        <StatCard label="Tasks" value={tasks.length} icon={<ListChecks className="h-5 w-5" />} accent="amber" />
        <StatCard label="Pipeline" value={`$${(deals.reduce((a, d) => a + d.value, 0) / 100).toLocaleString()}`} icon={<Database className="h-5 w-5" />} accent="violet" />
      </div>
      <PipelineBoard deals={deals} tasks={tasks} onRefresh={refresh} />
    </div>
  );
}
