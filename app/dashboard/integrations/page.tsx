"use client";

import { useEffect, useState } from "react";
import { Plug, Plus, Trash2, Loader2, Copy, Zap } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";

const scopes = ["read:tools", "read:deals", "write:inbox", "admin"];
const integrations = [
  { name: "Stripe", desc: "Process payments & subscriptions", icon: "💳", color: "#635bff", connected: true },
  { name: "OpenAI", desc: "AI assistant & content", icon: "🤖", color: "#10a37f", connected: true },
  { name: "Slack", desc: "Team notifications", icon: "📮", color: "#4a154b", connected: false },
  { name: "Shopify", desc: "Sync products & orders", icon: "🛍️", color: "#96bf48", connected: false },
  { name: "Google Analytics", desc: "Traffic & conversion", icon: "📊", color: "#e94235", connected: false },
  { name: "Zapier", desc: "Connect 5,000+ apps", icon: "⚡", color: "#ff4f00", connected: false },
];

export default function IntegrationsPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [selScopes, setSelScopes] = useState<string[]>(["read"]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [integrationState, setIntegrationState] = useState(integrations);

  useEffect(() => {
    fetch("/api/keys").then((r) => r.json()).then((d) => { setKeys(d.keys || []); setLoading(false); });
  }, []);

  async function create() {
    if (!name) return toast.error("Name your key");
    const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, permissions: selScopes }) });
    const data = await res.json();
    if (data.ok) { setNewSecret(data.key); setModal(false); setName(""); toast.success("API key created"); reload(); }
  }
  async function reload() { const d = await fetch("/api/keys").then((r) => r.json()); setKeys(d.keys || []); }
  async function del(k: any) { if (!confirm("Revoke key?")) return; await fetch("/api/keys", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: k.id }) }); reload(); }

  function toggleIntegration(i: any) {
    setIntegrationState((s) => s.map((x) => x.name === i.name ? { ...x, connected: !x.connected } : x));
    toast.success(i.connected ? "Disconnected" : "Connected");
  }

  return (
    <div>
      <PageHeader eyebrow="Integrations" title="Integrations & API" description="Connect apps and manage API keys." actions={<Button size="sm" onClick={() => setModal(true)}><Plus className="h-4 w-4" /> Create API key</Button>} />
      <h2 className="mb-3 text-sm font-semibold">Connected apps</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {integrationState.map((i) => (
          <Card key={i.name} className={`p-4 ${i.connected ? "border-[#bbf7d0]" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: `${i.color}1a` }}>{i.icon}</span>
              <Switch checked={i.connected} onCheckedChange={() => toggleIntegration(i)} />
            </div>
            <div className="mt-3 font-semibold">{i.name}</div>
            <div className="text-xs text-muted-foreground">{i.desc}</div>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold">API keys</h2>
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : keys.length === 0 ? (
        <EmptyState icon={<Plug className="h-6 w-6" />} title="No API keys" description="Create a key to access the PEAKLOOP API." />
      ) : (
        <Card className="divide-y divide-border">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{k.name}</div>
                <div className="text-xs text-muted-foreground">{k.prefix}... · {k.permissions?.length} scopes · {k.lastUsed ? `Last used ${timeAgo(k.lastUsed)}` : "Never used"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">{k.permissions?.join(", ")}</Badge>
                <Button variant="ghost" size="icon-sm" onClick={() => del(k)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {newSecret && (
        <Card className="mt-6 border-[#bbf7d0] p-5">
          <div className="flex items-center gap-2 font-semibold text-[#047857]"><Zap className="h-4 w-4" /> Save this secret — it won't be shown again</div>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 p-3 font-mono text-sm">{newSecret}
            <button onClick={() => { navigator.clipboard.writeText(newSecret); toast.success("Copied"); }} className="ml-auto"><Copy className="h-4 w-4 text-muted-foreground" /></button>
          </div>
        </Card>
      )}

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create API key</DialogTitle><DialogDescription>Scopes control what the key can access.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1 block">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production server" /></div>
            <div><Label className="mb-1 block">Scopes</Label>
              <div className="space-y-1.5">{scopes.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selScopes.includes(s)} onChange={(e) => setSelScopes(e.target.checked ? [...selScopes, s] : selScopes.filter((x) => x !== s))} className="h-4 w-4 accent-[#22c55e]" />{s}</label>
              ))}</div>
            </div>
            <Button onClick={create} className="w-full">Create key</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
