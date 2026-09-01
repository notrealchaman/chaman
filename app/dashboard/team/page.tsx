"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Trash2, Loader2, Shield, Settings, Headphones, Megaphone, BarChart3, Eye } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { initials } from "@/lib/utils";

const roles = ["OWNER", "ADMIN", "MANAGER", "SUPPORT", "MARKETING", "ANALYST", "VIEWER"];
const roleIcon: Record<string, any> = { OWNER: Shield, ADMIN: Settings, MANAGER: Users, SUPPORT: Headphones, MARKETING: Megaphone, ANALYST: BarChart3, VIEWER: Eye };

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");

  async function load() {
    const res = await fetch("/api/team");
    const data = await res.json();
    setMembers(data.members || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function invite() {
    if (!email) return toast.error("Add an email");
    const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
    const data = await res.json();
    if (data.ok) { toast.success("Invitation sent"); setOpen(false); setEmail(""); load(); }
    else toast.error(data.error);
  }

  async function changeRole(m: any, r: string) {
    await fetch("/api/team", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id, role: r }) });
    load();
  }

  async function del(m: any) {
    if (!confirm(`Remove ${m.name || m.email}?`)) return;
    await fetch("/api/team", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: m.id }) });
    toast.success("Removed");
    load();
  }

  return (
    <div>
      <PageHeader eyebrow="Team" title="Team Management" description="Invite teammates and control permissions." actions={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Invite member</Button>} />
      {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /> : (
        <div className="space-y-3">
          {members.length === 0 && <EmptyState icon={<Users className="h-6 w-6" />} title="No team members" description="Invite your team to collaborate on PEAKLOOP." />}
          {members.map((m) => {
            const Icon = roleIcon[m.role] || Users;
            return (
              <Card key={m.id} className="flex items-center gap-4 p-4">
                <Avatar><AvatarFallback className="bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-white">{initials(m.name || m.email)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="font-medium">{m.name || "Invited"}</div>
                  <div className="text-sm text-muted-foreground">{m.email}</div>
                </div>
                <Badge variant={m.status === "ACTIVE" ? "success" : "amber"}>{m.status}</Badge>
                <select value={m.role} onChange={(e) => changeRole(m, e.target.value)} className="rounded-lg border border-input bg-white px-2 py-1.5 text-sm">
                  {roles.map((r) => <option key={r}>{r}</option>)}
                </select>
                <Button variant="ghost" size="icon-sm" onClick={() => del(m)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Invite a teammate</DialogTitle><DialogDescription>They'll get an email to join your workspace.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1 block">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label className="mb-1 block">Role</Label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm">
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <Button onClick={invite} className="w-full">Send invitation</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
