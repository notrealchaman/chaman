import { notFound } from "next/navigation";
import { getCategoryBySlug, getTools } from "@/lib/data";
import { ToolCard } from "@/components/tool-card";
import { Icon } from "@/components/shared/icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return {};
  return { title: `${cat.name} Software | PEAKLOOP`, description: cat.description };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();
  const { tools } = getTools({ category: slug, sort: "recommended", perPage: 48 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ background: cat.color }}>
            <Icon name={cat.icon} className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{cat.name}</h1>
            <p className="mt-1 text-muted-foreground">{cat.description}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#047857]">{tools.length} tools</span>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
      </div>
    </div>
  );
}
