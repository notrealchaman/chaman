import { BellRing, CalendarClock, DollarSign } from "lucide-react";

import { getSubscriptions, getDeals } from "@/lib/data";

import { requireUser } from "@/lib/session";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate, relativeDays } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
    const { id: userId } = await requireUser();
  const subs = getSubscriptions(userId);
  const deals = getDeals().slice(0, 6);
  const renewals = subs.filter((s) => s.renewalDate);

  return (
    <div>
      <PageHeader eyebrow="Alerts" title="Alerts & Reminders" description="Never miss a renewal, price drop or deal." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><CalendarClock className="h-4 w-4" /> Upcoming renewals</h2>
          <div className="space-y-3">
            {renewals.length === 0 && <EmptyState title="No upcoming renewals" />}
            {renewals.map((s) => {
              const d = relativeDays(s.renewalDate);
              return (
                <Card key={s.id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">Renews {formatDate(s.renewalDate)}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{formatMoney(s.priceMonthly)}/mo</span>
                    <div><Badge variant={d <= 3 ? "destructive" : d <= 7 ? "amber" : "secondary"}>{d <= 0 ? "Today" : `in ${d} days`}</Badge></div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><DollarSign className="h-4 w-4" /> Price drops & deals</h2>
          <div className="space-y-3">
            {deals.map((d) => (
              <Card key={d.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{d.title}</div>
                  <div className="text-xs text-muted-foreground">{d.toolName || d.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{d.discount}</Badge>
                  <span className="text-sm font-semibold text-[#047857]">{formatMoney(d.currentPrice)}/mo</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
