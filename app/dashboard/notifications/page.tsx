"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2, Sparkles, DollarSign, Repeat, MessageSquare, Database, ShoppingBag, Headphones, Shield } from "lucide-react";
import { PageHeader } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";

const iconMap: Record<string, any> = {
  PRICE_DROP: DollarSign, DEAL: Sparkles, RENEWAL: Repeat, REVIEW: MessageSquare,
  CRM: Database, ORDER: ShoppingBag, SUPPORT: Headphones, SECURITY: Shield, AI: Sparkles, SYSTEM: Bell,
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifs(data.notifications || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function markAll() {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    toast.success("All marked as read");
    load();
  }

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader eyebrow="Notifications" title="Notification Center" description="Price drops, deals, renewals and more." actions={<Button size="sm" variant="outline" onClick={markAll}><CheckCheck className="h-4 w-4" /> Mark all read</Button>} />
      <div className="mb-4 text-sm text-muted-foreground"><Badge variant="secondary">{unread} unread</Badge></div>
      {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /> : (
        <div className="space-y-3">
          {notifs.length === 0 && <Card className="p-10 text-center text-sm text-muted-foreground">No notifications.</Card>}
          {notifs.map((n) => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <Card key={n.id} className={`flex items-start gap-4 p-4 ${n.read ? "opacity-70" : "border-[#bbf7d0]"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#16a34a]"><Icon className="h-5 w-5" /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="font-medium">{n.title}</span>{!n.read && <span className="h-2 w-2 rounded-full bg-[#16a34a]" />}</div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  <div className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
