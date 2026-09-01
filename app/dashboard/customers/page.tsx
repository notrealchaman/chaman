"use client";

import { useEffect, useState } from "react";
import { Users, Loader2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { timeAgo, initials } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => { fetch("/api/social?type=customers").then((r) => r.json()).then((d) => { setCustomers(d.customers || []); setLoading(false); }); }, []);
  const filtered = customers.filter((c) => (c.name + c.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader eyebrow="Customers" title="Customers" description="Everyone who buys from you, in one place." />
      <div className="relative mb-5 max-w-md"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" /></div>
      {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /> : filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No customers" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="flex items-center gap-3 p-4">
              <Avatar><AvatarFallback className="bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-white">{initials(c.name)}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{c.name}</div>
                <div className="truncate text-xs text-muted-foreground">{c.email}</div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">{c.channel}</Badge>
                <div className="mt-1 text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
