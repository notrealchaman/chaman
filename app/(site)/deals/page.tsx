import { getDeals } from "@/lib/data";
import { DealCard } from "@/components/deal-card";
import { Section, SectionHeading } from "@/components/site/section";

export const metadata = { title: "Software Deals & Discounts | PEAKLOOP", description: "Limited-time deals and coupons on the best SaaS tools." };
export const dynamic = "force-dynamic";

export default function DealsPage() {
  const deals = getDeals();
  const categories = ["All", "AI", "Marketing", "Hosting", "Developer", "Design", "Business", "Productivity", "Automation", "No-Code"];
  return (
    <Section>
      <SectionHeading eyebrow="Deals" title="Software deals & coupons" description="Save money on the tools you love with limited-time offers." />
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button key={c} className="rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-[#bbf7d0] hover:text-[#047857]">{c}</button>
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((d) => <DealCard key={d.id} deal={d} />)}
      </div>
    </Section>
  );
}
