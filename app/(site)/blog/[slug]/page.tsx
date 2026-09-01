import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, getBlogPosts, getToolBySlug } from "@/lib/data";
import type { Tool } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/tool-card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return { title: post.seoTitle || post.title, description: post.metaDescription || post.excerpt, openGraph: { title: post.title, description: post.excerpt } };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const related: Tool[] = post.relatedTools.map((s) => getToolBySlug(s)).filter((t): t is Tool => Boolean(t));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/blog" className="hover:text-foreground">Blog</Link> / <span className="text-foreground">{post.title}</span>
      </nav>
      <Badge variant="secondary">{post.categoryName}</Badge>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-xs font-bold text-white">{post.author.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
        <span className="font-medium text-foreground">{post.author}</span>
        <span>·</span>
        <span>{formatDate(post.publishedAt)}</span>
      </div>
      <div className="mt-8 h-64 w-full rounded-2xl bg-gradient-to-br from-[#d1fadf] to-[#e0f2fe]" />
      <div className="prose prose-slate mt-8 max-w-none leading-relaxed text-slate-600" dangerouslySetInnerHTML={{ __html: post.content }} />
      <div className="mt-6 flex flex-wrap gap-2">
        {post.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold">Related tools</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {related.map((t) => <ToolCard key={t.slug} tool={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}
