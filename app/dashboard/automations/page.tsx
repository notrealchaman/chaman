"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { WorkflowEditor } from "@/components/dashboard/workflow-editor";
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

  if (loading) return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <WorkflowEditor automations={automations} onRefresh={load} />
    </div>
  );
}
