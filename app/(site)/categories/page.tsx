import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/data";
import { Icon } from "@/components/shared/icon";
import { Section, SectionHeading } from "@/components/site/section";

export const metadata = { title: "Browse Software Categories | PEAKLOOP", description: "Explore software across every category — AI, CRM, marketing, finance and more." };
export const dynamic = "force-dynamic";

export default function CategoriesPage() {
  const categories = getCategories();
  return (
    <Section>
      <SectionHeading eyebrow="Categories" title="Explore by category" description="Find the perfect tools for every part of your business." />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.slug} href={`/categories/${c.slug}`} className="group flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:border-[#bbf7d0] hover:shadow-md">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: c.color }}>
              <Icon name={c.icon} className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{c.name}</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <span className="mt-2 inline-block text-xs font-medium text-[#047857]">{c.toolCount} tools</span>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
