"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, CreditCard, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ToolIcon } from "@/components/shared/tool-icon";
import { formatMoney, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Subscription } from "@/lib/types";

const emptyForm = { name: "", logo: "", color: "#22c55e", priceMonthly: "", priceYearly: "", billingCycle: "MONTHLY", renewalDate: "", category: "Productivity" };

export function SubscriptionsManager() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/subscriptions");
    const data = await res.json();
    setSubs(data.subscriptions || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const totalMonthly = subs.reduce((a, s) => a + s.priceMonthly, 0);
  const totalYearly = subs.reduce((a, s) => a + s.priceYearly, 0);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  }
  function openEdit(s: Subscription) {
    setEditing(s);
    setForm({ name: s.name, logo: s.logo, color: s.color, priceMonthly: String(s.priceMonthly), priceYearly: String(s.priceYearly), billingCycle: s.billingCycle, renewalDate: s.renewalDate?.slice(0, 10) || "", category: s.category });
    setModal(true);
  }

  async function save() {
    if (!form.name) return toast.error("Please add a name");
    setSaving(true);
    try {
      const payload = { ...form, id: editing?.id, priceMonthly: Number(form.priceMonthly || 0), priceYearly: Number(form.priceYearly || 0) };
      const res = await fetch("/api/subscriptions", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.ok) { toast.success(editing ? "Updated" : "Added"); setModal(false); load(); }
      else toast.error(data.error);
    } finally { setSaving(false); }
  }

  async function del(s: Subscription) {
    if (!confirm(`Remove ${s.name}?`)) return;
    await fetch("/api/subscriptions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id }) });
    toast.success("Removed");
    load();
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Monthly spend</div>
          <div className="mt-1 text-2xl font-bold">{formatMoney(totalMonthly)}/mo</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Annual spend</div>
          <div className="mt-1 text-2xl font-bold">{formatMoney(totalYearly || totalMonthly * 12)}/yr</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Active subscriptions</div>
          <div className="mt-1 text-2xl font-bold">{subs.length}</div>
        </Card>
      </div>

      <Card className="mt-4 flex items-center gap-3 p-4">
        <Sparkles className="h-5 w-5 shrink-0 text-[#16a34a]" />
        <p className="text-sm text-muted-foreground">
          PEAK AI estimates you could save <span className="font-semibold text-[#047857]">~$47/mo</span> by switching or consolidating overlapping tools.
        </p>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your subscriptions</h2>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add subscription</Button>
      </div>

      <div className="mt-4 space-y-3">
        {loading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />}
        {!loading && subs.length === 0 && <Card className="p-10 text-center text-sm text-muted-foreground">No subscriptions yet. Add your first one.</Card>}
        {subs.map((s) => (
          <div key={s.id} className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm">
            <ToolIcon name={s.name} logo={s.logo} color={s.color} size="md" />
            <div className="flex-1 min-w-0">
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.category} · {s.billingCycle === "MONTHLY" ? "Monthly" : "Yearly"}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{formatMoney(s.priceMonthly)}/mo</div>
              <div className="text-xs text-muted-foreground">Renews {formatDate(s.renewalDate)}</div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)} aria-label="Edit"><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon-sm" onClick={() => del(s)} aria-label="Delete"><Trash2 className="h-4 w-4 text-red-500" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit subscription" : "Add subscription"}</DialogTitle>
            <DialogDescription>Track a SaaS subscription.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="mb-1 block">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="mb-1 block">Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="mb-1 block">Monthly ($)</Label><Input type="number" value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })} /></div>
              <div><Label className="mb-1 block">Yearly ($)</Label><Input type="number" value={form.priceYearly} onChange={(e) => setForm({ ...form, priceYearly: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="mb-1 block">Billing</Label>
                <select value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm"><option value="MONTHLY">Monthly</option><option value="YEARLY">Yearly</option></select>
              </div>
              <div><Label className="mb-1 block">Renewal date</Label><Input type="date" value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-3">
              <Label className="mb-1 block">Color</Label>
              <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-8 w-12 rounded border" />
            </div>
            <Button onClick={save} disabled={saving} className="w-full">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
