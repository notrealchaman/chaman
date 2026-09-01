import { SubscriptionsManager } from "@/components/dashboard/subscriptions-manager";
import { PageHeader } from "@/components/dashboard/ui";
import { getSpendSeries } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { CategoryDonut } from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
    const { id: userId } = await requireUser();
    const spend = getSpendSeries(userId);
  return (
    <div>
      <PageHeader eyebrow="Subscriptions" title="Subscription Manager" description="Track spend, renewal dates and savings across all your SaaS." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><SubscriptionsManager /></div>
        <div>
          <h2 className="mb-3 text-sm font-semibold">Spend by category</h2>
          <div className="rounded-2xl border border-border bg-white shadow-sm"><CategoryDonut data={spend} /></div>
        </div>
      </div>
    </div>
  );
}
