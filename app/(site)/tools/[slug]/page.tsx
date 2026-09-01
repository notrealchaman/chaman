import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Sparkles, ArrowUpRight, Check, X, ExternalLink } from "lucide-react";
import { getToolBySlug, getToolReviews, getTools } from "@/lib/data";
import { ToolCard } from "@/components/tool-card";
import { ToolIcon } from "@/components/shared/tool-icon";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReviewForm } from "@/components/review-form";
import { formatMoney, timeAgo } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Reviews, Pricing & Features | PEAKLOOP`,
    description: tool.description,
    openGraph: { title: `${tool.name} — Reviews & Pricing`, description: tool.description, type: "website" },
    twitter: { card: "summary_large_image", title: `${tool.name} | PEAKLOOP` },
  };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const reviews = getToolReviews(tool.id, "newest", "APPROVED", 30);
  const alternatives = getTools({ category: tool.categorySlug, sort: "highest-rated", perPage: 4 }).tools.filter((t) => t.slug !== tool.slug).slice(0, 3);
  const features = tool.features || [];
  const pricing = tool.pricing || [];
  const screenshots = tool.screenshots || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link> /
        <Link href="/tools" className="hover:text-foreground">Tools</Link> /
        <Link href={`/categories/${tool.categorySlug}`} className="hover:text-foreground">{tool.categoryName}</Link> /
        <span className="text-foreground">{tool.name}</span>
      </nav>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <ToolIcon name={tool.name} logo={tool.logo} color={tool.color} size="xl" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold sm:text-3xl">{tool.name}</h1>
              {tool.verified && <Badge variant="success"><BadgeCheck className="h-3 w-3" /> Verified</Badge>}
              {tool.aiPowered && <Badge variant="violet"><Sparkles className="h-3 w-3" /> AI-powered</Badge>}
            </div>
            <p className="mt-1 text-muted-foreground">{tool.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <StarRating rating={tool.rating} count={tool.reviewCount} />
              <Link href={`/categories/${tool.categorySlug}`} className="text-sm text-[#047857] hover:underline">{tool.categoryName}</Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:flex-col">
            <Button asChild><a href={tool.website} target="_blank" rel="noreferrer">Visit Website <ExternalLink className="h-4 w-4" /></a></Button>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Overview</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{tool.longDescription}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {tool.integrations.map((ig) => <Badge key={ig} variant="secondary">{ig}</Badge>)}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Starting price", value: tool.startingPrice === 0 ? "Free" : `${formatMoney(tool.startingPrice)}/mo` },
              { label: "Free plan", value: tool.freePlan ? "Yes" : "No" },
              { label: "Free trial", value: tool.freeTrial ? "Yes" : "No" },
              { label: "Team size", value: tool.companySize },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <div className="mt-1 font-semibold">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Key features</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {features.map((f) => (
                  <div key={f.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 font-medium"><Check className="h-4 w-4 text-[#16a34a]" /> {f.name}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pros / cons */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-[#f0fdf4] p-6 shadow-sm">
              <h3 className="font-semibold text-[#047857]">Pros</h3>
              <ul className="mt-3 space-y-2">
                {(tool.pros.length ? tool.pros : ["Powerful features", "Good value", "Reliable"]).map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-600"><Check className="mt-0.5 h-4 w-4 text-[#16a34a]" /> {p}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-red-50/60 p-6 shadow-sm">
              <h3 className="font-semibold text-red-600">Cons</h3>
              <ul className="mt-3 space-y-2">
                {(tool.cons.length ? tool.cons : ["No offline mode", "Can be pricey at scale"]).map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-slate-600"><X className="mt-0.5 h-4 w-4 text-red-500" /> {c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Screenshots</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {screenshots.slice(0, 3).map((s) => (
                  <div key={s.id} className="overflow-hidden rounded-xl border border-border bg-slate-50">
                    <img src={s.url} alt={`${tool.name} ${s.caption}`} className="aspect-video w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Reviews</h2>
              <ReviewForm toolId={tool.id} toolName={tool.name} />
            </div>
            <div className="mt-5 space-y-5">
              {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review {tool.name}.</p>}
              {reviews.slice(0, 8).map((r) => (
                <div key={r.id} className="border-b border-border pb-5 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{(r.user?.name || "A").slice(0, 1)}</span>
                      <div>
                        <div className="text-sm font-medium">{r.user?.name}</div>
                        <div className="text-xs text-muted-foreground">{r.useCase} · {r.companySize}</div>
                      </div>
                    </div>
                    {r.verified && <Badge variant="success">Verified</Badge>}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating rating={r.rating} />
                    <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                  </div>
                  <h3 className="mt-2 font-medium">{r.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{r.content}</p>
                  {r.pros.length > 0 && <div className="mt-2 text-xs text-[#047857]">Pros: {r.pros.join(", ")}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: pricing */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h3 className="text-lg font-semibold">Pricing</h3>
            <div className="mt-4 space-y-3">
              {pricing.length === 0 && <p className="text-sm text-muted-foreground">Pricing on the vendor site.</p>}
              {pricing.map((p) => (
                <div key={p.id} className={`rounded-lg border p-3 ${p.popular ? "border-[#22c55e] bg-[#f0fdf4]" : "border-border"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{p.planName}</span>
                    {p.popular && <Badge>Popular</Badge>}
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold">{p.monthly === 0 ? "Free" : `$${formatMoney(p.monthly).replace("$", "")}`}</span>
                    {p.monthly > 0 && <span className="text-xs text-muted-foreground">/mo</span>}
                  </div>
                  {p.monthly > 0 && <div className="text-xs text-muted-foreground">or ${formatMoney(p.annual).replace("$", "")}/mo annually</div>}
                  <div className="mt-2 text-xs text-muted-foreground">{p.users} {p.users === 1 ? "user" : "users"} · {p.storage}</div>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                    {p.features.slice(0, 4).map((f) => <li key={f} className="flex items-center gap-1.5"><Check className="h-3 w-3 text-[#16a34a]" /> {f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-slate-50 p-6">
            <h3 className="font-semibold">Company</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div><span className="text-muted-foreground">Founded:</span> {tool.founded || "—"}</div>
              <div><span className="text-muted-foreground">HQ:</span> {tool.headquarters || "—"}</div>
              <div><span className="text-muted-foreground">Size:</span> {tool.companySize}</div>
            </div>
          </div>

          {/* FAQ */}
          {tool.faq.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h3 className="font-semibold">FAQ</h3>
              <div className="mt-3 space-y-3">
                {tool.faq.map((f) => (
                  <div key={f.q}>
                    <div className="text-sm font-medium">{f.q}</div>
                    <div className="text-sm text-muted-foreground">{f.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Alternatives to {tool.name}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {alternatives.map((t) => <ToolCard key={t.slug} tool={t} />)}
          </div>
        </section>
      )}
    </div>
  );
}
