"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, User } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";
import { toast } from "sonner";

export default function SettingsPage() {
  const [form, setForm] = useState({ name: "", email: "", role: "", accountType: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      if (d.user) setForm({ name: d.user.name || "", email: d.user.email || "", role: d.user.role, accountType: d.user.accountType });
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name }) });
    toast.success("Profile updated");
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Account Settings" description="Manage your profile and preferences." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20"><AvatarFallback className="bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-2xl text-white">{initials(form.name)}</AvatarFallback></Avatar>
            <div className="mt-3 font-semibold">{form.name}</div>
            <div className="text-sm text-muted-foreground">{form.email}</div>
            <Badge variant="success" className="mt-2">{form.accountType} account</Badge>
            <Badge variant="secondary" className="mt-1">{form.role}</Badge>
          </div>
        </Card>
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="mb-4 font-semibold">Profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="mb-1 block">Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="mb-1 block">Email</Label><Input value={form.email} disabled /></div>
            </div>
            <Button onClick={save} disabled={saving} className="mt-4">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes</Button>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 font-semibold"><User className="h-4 w-4" /> Preferences</div>
            <p className="mt-2 text-sm text-muted-foreground">Notification preferences, language and more are set here.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
