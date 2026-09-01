import { ReceiptText, CreditCard } from "lucide-react";

import { getPayments, getInvoices } from "@/lib/data";

import { requireUser } from "@/lib/session";
import { PageHeader, StatCard, EmptyState } from "@/components/dashboard/ui";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
    const { id: userId } = await requireUser();
  const payments = getPayments(userId);
  const invoices = getInvoices(userId);
  const totalPaid = payments.filter((p) => p.status === "SUCCEEDED").reduce((a, p) => a + p.amount, 0);

  return (
    <div>
      <PageHeader eyebrow="Billing" title="Billing & Invoices" description="Manage your subscription plan and payment history." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current plan" value="Pro" icon={<CreditCard className="h-5 w-5" />} hint="$9/mo" />
        <StatCard label="Total paid" value={formatMoney(totalPaid)} icon={<ReceiptText className="h-5 w-5" />} accent="sky" />
        <StatCard label="Invoices" value={invoices.length} icon={<ReceiptText className="h-5 w-5" />} accent="amber" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-semibold">Payments</h2></CardHeader>
          <CardContent className="space-y-3">
            {payments.length === 0 && <EmptyState title="No payments yet" />}
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="text-sm font-medium">{p.plan} plan</div>
                  <div className="text-xs text-muted-foreground">{formatDate(p.createdAt)} · {p.provider}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatMoney(p.amount)}</span>
                  <Badge variant={p.status === "SUCCEEDED" ? "success" : p.status === "REFUNDED" ? "mute" : "amber"}>{p.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-semibold">Invoices</h2></CardHeader>
          <CardContent className="space-y-3">
            {invoices.length === 0 && <EmptyState title="No invoices yet" />}
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="text-sm font-medium">{inv.number}</div>
                  <div className="text-xs text-muted-foreground">Due {formatDate(inv.dueDate)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatMoney(inv.amount)}</span>
                  <Badge variant="success">{inv.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
