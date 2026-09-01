import { DollarSign, ShoppingBag, Users, TrendingUp, Sparkles } from "lucide-react";

import { getAnalyticsMetrics, getSalesByChannel, getRevenueSeries, getTopCustomers } from "@/lib/data";

import { requireUser } from "@/lib/session";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { RevenueChart, MiniBars } from "@/components/dashboard/charts";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
    const { id: userId } = await requireUser();
  const metrics = getAnalyticsMetrics(userId);
  const sales = getSalesByChannel(userId);
  const revenue = getRevenueSeries();
  const topCustomers = getTopCustomers(userId);

  return (
    <div>
      <PageHeader eyebrow="PEAK Analytics" title="Business Analytics" description="Understand revenue, customers and performance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Revenue" value={formatMoney(metrics.revenue)} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Orders" value={metrics.orders} icon={<ShoppingBag className="h-5 w-5" />} accent="sky" />
        <StatCard label="Customers" value={metrics.customers} icon={<Users className="h-5 w-5" />} accent="amber" />
        <StatCard label="Conversion" value={`${metrics.conversion}%`} icon={<TrendingUp className="h-5 w-5" />} accent="violet" />
        <StatCard label="Retention" value={`${metrics.retention}%`} icon={<TrendingUp className="h-5 w-5" />} accent="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><RevenueChart data={revenue} /></div>
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-[#16a34a]" /> AI Insights</div>
            <div className="mt-3 space-y-2.5 text-sm text-slate-600">
              <p>• Revenue increased <span className="font-semibold text-[#047857]">18%</span> this month.</p>
              <p>• Your highest-converting channel is <span className="font-semibold">Instagram</span>.</p>
              <p>• Product “Hoodie” has dropped <span className="font-semibold text-red-600">14%</span> in sales.</p>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold">Top customers</h3>
            <div className="mt-3 space-y-2.5">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ecfdf5] text-xs font-bold text-[#047857]">{i + 1}</span>{c.name}</span>
                  <span className="font-medium">{formatMoney(c.revenue)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="p-5 border-b border-border"><h2 className="font-semibold">Sales by channel</h2></div>
          <MiniBars data={sales} />
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Summary</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-[#f0fdf4] p-4"><div className="text-xs text-muted-foreground">Profit</div><div className="text-xl font-bold">{formatMoney(metrics.profit)}</div></div>
            <div className="rounded-lg bg-slate-50 p-4"><div className="text-xs text-muted-foreground">Avg order value</div><div className="text-xl font-bold">{formatMoney(metrics.orders ? Math.round(metrics.revenue / metrics.orders) : 0)}</div></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
