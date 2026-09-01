"use client";

import { useState } from "react";
import { Plus, Loader2, GripVertical, Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/utils";
import { toast } from "sonner";
import type { CRMDeal, CRMTask } from "@/lib/types";

const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

export function PipelineBoard({ deals, tasks, onRefresh }: { deals: CRMDeal[]; tasks: CRMTask[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", value: "", contact: "", stage: "Lead" });

  async function move(deal: CRMDeal, stage: string) {
    await fetch("/api/crm/deals", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: deal.id, stage }) });
    onRefresh();
  }

  async function addDeal() {
    if (!form.title) return toast.error("Add a title");
    setSaving(true);
    await fetch("/api/crm/deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, value: Number(form.value || 0) }) });
    setSaving(false);
    setOpen(false);
    setForm({ title: "", value: "", contact: "", stage: "Lead" });
    toast.success("Deal created");
    onRefresh();
  }

  async function toggleTask(t: CRMTask) {
    await fetch("/api/crm/tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id, done: !t.done, title: t.title }) });
    onRefresh();
  }

  const totalValue = deals.filter((d) => d.stage !== "Lost").reduce((a, d) => a + d.value, 0);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Pipeline value: <span className="font-semibold text-foreground">{formatMoney(totalValue)}</span></div>
        <Button onClick={() => setOpen(true)} size="sm"><Plus className="h-4 w-4" /> New deal</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const value = stageDeals.reduce((a, d) => a + d.value, 0);
          return (
            <div key={stage} className="rounded-xl bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{stage}</span>
                <span className="text-xs text-muted-foreground">{formatMoney(value)}</span>
              </div>
              <div className="space-y-2">
                {stageDeals.length === 0 && <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">Drop deals here</div>}
                {stageDeals.map((d) => (
                  <div key={d.id} className="rounded-lg border border-border bg-white p-3 shadow-sm">
                    <div className="flex items-start gap-1">
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium">{d.title}</div>
                        <div className="text-xs text-muted-foreground">{d.owner || "Unassigned"}</div>
                        <div className="mt-1 text-sm font-semibold">{formatMoney(d.value)}</div>
                      </div>
                    </div>
                    {stage !== "Won" && stage !== "Lost" && (
                      <select value={stage} onChange={(e) => move(d, e.target.value)} className="mt-2 w-full rounded border border-border bg-white px-2 py-1 text-xs">
                        {stages.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Card className="mt-6 p-5">
        <h3 className="mb-3 text-sm font-semibold">Upcoming tasks</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {tasks.map((t) => (
            <button key={t.id} onClick={() => toggleTask(t)} className="flex items-center gap-2 rounded-lg border border-border p-3 text-left text-sm hover:bg-slate-50">
              {t.done ? <Check className="h-4 w-4 text-[#16a34a]" /> : <Circle className="h-4 w-4 text-slate-300" />}
              <span className={t.done ? "line-through text-muted-foreground" : ""}>{t.title}</span>
            </button>
          ))}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New deal</DialogTitle><DialogDescription>Create a deal in your pipeline.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1 block">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="mb-1 block">Value ($)</Label><Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
              <div><Label className="mb-1 block">Contact</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
            </div>
            <div><Label className="mb-1 block">Stage</Label>
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm">{stages.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <Button onClick={addDeal} disabled={saving} className="w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create deal"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
