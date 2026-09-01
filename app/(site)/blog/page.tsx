import Link from "next/link";
import { getBlogPosts } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeading } from "@/components/site/section";

export const metadata = { title: "PEAKLOOP Blog — SaaS Guides & Insights", description: "Guides, comparisons and insights on choosing and using the best business software." };
export const dynamic = "force-dynamic";

export default function BlogPage() {
  const posts = getBlogPosts();
  const categories = ["AI", "Business", "Marketing", "SaaS", "Productivity", "Technology", "Startups"];
  return (
    <Section>
      <SectionHeading eyebrow="Blog" title="Guides & insights" description="Learn how to choose, compare and get the most from your software stack." />
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => <button key={c} className="rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm hover:border-[#bbf7d0] hover:text-[#047857]">{c}</button>)}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:border-[#bbf7d0] hover:shadow-md">
            <div className="h-44 w-full bg-gradient-to-br from-[#d1fadf] to-[#e0f2fe]" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{p.categoryName || "SaaS"}</Badge>
                <span>{p.author}</span>
              </div>
              <h3 className="mt-2 line-clamp-2 text-lg font-semibold group-hover:text-[#047857]">{p.title}</h3>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
