"use client";

import { useState } from "react";
import { Zap, Plus, Trash2, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Automation } from "@/lib/types";

const triggerOptions = ["New Lead", "Order Paid", "New Review", "Ticket Created", "Subscription Renewal", "Form Submitted"];
const actionOptions = ["Send Email", "Create Task", "Add Tag", "Move Stage", "Send Webhook", "Notify Team"];

export function AutomationBuilder({ automations, onRefresh }: { automations: Automation[]; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState(triggerOptions[0]);
  const [selectedActions, setSelectedActions] = useState<string[]>(["Send Email"]);

  async function save() {
    if (!name) return toast.error("Name your workflow");
    await fetch("/api/automations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description, triggers: [trigger], actions: selectedActions, active: true }) });
    setOpen(false); setName(""); setDescription(""); setSelectedActions(["Send Email"]); toast.success("Workflow created"); onRefresh();
  }

  async function toggle(a: Automation) {
    await fetch("/api/automations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id, name: a.name, active: !a.active }) });
    onRefresh();
  }

  async function del(a: Automation) {
    if (!confirm("Delete this workflow?")) return;
    await fetch("/api/automations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id }) });
    onRefresh();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New workflow</Button>
      </div>

      <div className="space-y-3">
        {automations.length === 0 && <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No workflows yet. Create your first automation.</div>}
        {automations.map((a) => (
          <div key={a.id} className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#16a34a]"><Zap className="h-5 w-5" /></span>
                <div>
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.description || "Automation"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={a.active ? "success" : "secondary"}>{a.active ? "Active" : "Inactive"}</Badge>
                <Play className={`h-4 w-4 cursor-pointer ${a.active ? "text-slate-400" : "text-[#16a34a]"}`} onClick={() => toggle(a)} />
                <Trash2 className="h-4 w-4 cursor-pointer text-red-400" onClick={() => del(a)} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {a.triggers?.map((t, i) => (
                <span key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  {i > 0 && <ArrowRight className="h-3 w-3" />}
                  <span className="rounded-lg bg-[#ecfdf5] px-2.5 py-1 font-medium text-[#047857]">{t.type}</span>
                </span>
              ))}
              {a.actions?.map((act, i) => (
                <span key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3" />
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{act.type}</span>
                </span>
              ))}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">Ran {a.runs.toLocaleString()} times</div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">New workflow</h3>
            <div className="mt-4 space-y-4">
              <div><label className="mb-1 block text-sm font-medium">Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome new leads" /></div>
              <div><label className="mb-1 block text-sm font-medium">Trigger</label>
                <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm">{triggerOptions.map((t) => <option key={t}>{t}</option>)}</select>
              </div>
              <div><label className="mb-1 block text-sm font-medium">Actions</label>
                <div className="space-y-1.5">
                  {actionOptions.map((act) => (
                    <label key={act} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={selectedActions.includes(act)} onChange={(e) => setSelectedActions(e.target.checked ? [...selectedActions, act] : selectedActions.filter((a) => a !== act))} className="h-4 w-4 accent-[#22c55e]" />
                      {act}
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={save} className="w-full">Create workflow</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
