import Link from "next/link";
import { Boxes, Heart, CreditCard, ReceiptText, Bell, TrendingUp, Sparkles, ArrowUpRight } from "lucide-react";
import { getDashboardStats, getSubscriptions, getTools, getNotifications, getFavoriteTools, getRevenueSeries } from "@/lib/data";

import { requireUser } from "@/lib/session";
import { PageHeader, StatCard } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToolCard } from "@/components/tool-card";
import { RevenueChart } from "@/components/dashboard/charts";
import { formatMoney, timeAgo, relativeDays } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
    const { id: userId } = await requireUser();
const stats = getDashboardStats(userId);
  const subs = getSubscriptions(userId);
  const recommended = getTools({ sort: "recommended", perPage: 6 }).tools;
  const saved = getFavoriteTools(userId).slice(0, 4);
  const notifs = getNotifications(userId, 6);
  const revenue = getRevenueSeries();

  return (
    <div>
      <PageHeader eyebrow="Command Center" title="Good morning, Ava" description="Here's what's happening across your business today." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total tools" value={stats.totalTools} icon={<Boxes className="h-5 w-5" />} hint="across all categories" />
        <StatCard label="Monthly spend" value={formatMoney(stats.monthlySpend)} icon={<CreditCard className="h-5 w-5" />} hint="across subscriptions" />
        <StatCard label="Saved tools" value={stats.savedTools} icon={<Heart className="h-5 w-5" />} accent="violet" />
        <StatCard label="Active subs" value={stats.activeSubs} icon={<ReceiptText className="h-5 w-5" />} accent="sky" />
        <StatCard label="Upcoming renewals" value={stats.upcomingRenewals} icon={<Bell className="h-5 w-5" />} accent="amber" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue} />
        </div>
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-[#16a34a]" /> PEAK AI insight</div>
            <p className="mt-2 text-sm text-muted-foreground">
              You spend <span className="font-semibold text-foreground">{formatMoney(stats.monthlySpend)}/mo</span> on software. You could save about{" "}
              <span className="font-semibold text-[#047857]">$47/mo</span> by consolidating overlapping tools.
            </p>
            <Button asChild size="sm" variant="soft" className="mt-3 w-full"><Link href="/dashboard/subscriptions">Review subscriptions</Link></Button>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recent activity</h3>
              <Link href="/dashboard/notifications" className="text-xs text-[#047857] hover:underline">View all</Link>
            </div>
            <div className="mt-4 space-y-3">
              {notifs.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-start gap-2.5">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#22c55e]" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your saved tools</h2>
          <Button asChild variant="outline" size="sm"><Link href="/dashboard/favorites">Manage <ArrowUpRight className="h-3.5 w-3.5" /></Link></Button>
        </div>
        {saved.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{saved.map((t) => <ToolCard key={t.slug} tool={t} savedInitial />)}</div>
        ) : (
          <Card className="p-8 text-center text-sm text-muted-foreground">No saved tools yet. Save tools you love so they show up here.</Card>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recommended for you</h2>
          <Button asChild variant="outline" size="sm"><Link href="/tools">Explore all</Link></Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{recommended.slice(0, 3).map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
      </div>
    </div>
  );
}
