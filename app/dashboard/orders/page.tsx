"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, timeAgo } from "@/lib/utils";
import { toast } from "sonner";

const statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const statusColor: Record<string, string> = { PENDING: "amber", PAID: "success", SHIPPED: "sky", DELIVERED: "default", CANCELLED: "mute", REFUNDED: "destructive" };

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  async function load() {
    const data = await fetch("/api/social?type=orders").then((r) => r.json());
    setOrders(data.orders || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(o: any, status: string) {
    await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: o.id, status }) });
    toast.success("Order updated");
    load();
  }

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <PageHeader eyebrow="Orders" title="Orders" description="Track and manage your orders across channels." />
      <div className="mb-4 flex flex-wrap gap-2">
        {["ALL", ...statuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === s ? "bg-[#16a34a] text-white" : "border border-border bg-white text-slate-600"}`}>{s}</button>
        ))}
      </div>
      {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /> : (
        <div className="space-y-3">
          {filtered.length === 0 && <EmptyState icon={<ShoppingBag className="h-6 w-6" />} title="No orders" description="Orders from your sales channels will appear here." />}
          {filtered.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="font-medium">#{o.id.slice(0, 8).toUpperCase()} · {o.customer}</div>
                  <div className="text-xs text-muted-foreground">{o.channel} · {timeAgo(o.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatMoney(o.total)}</span>
                  <select value={o.status} onChange={(e) => updateStatus(o, e.target.value)} className="rounded-lg border border-input bg-white px-2 py-1 text-sm">
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                {o.items?.map((it: any, i: number) => <Badge key={i} variant="secondary">{it.name} ×{it.qty}</Badge>)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
