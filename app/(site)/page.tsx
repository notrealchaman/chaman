import Link from "next/link";
import { ArrowRight, Sparkles, Database, Headphones, Share2, Workflow, BarChart3 } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { Section, SectionHeading } from "@/components/site/section";
import { ToolCard } from "@/components/tool-card";
import { ComparePromo } from "@/components/site/compare-promo";
import { AiRecommend } from "@/components/site/ai-recommend";
import { DashboardPreview } from "@/components/site/dashboard-preview";
import { FeatureShowcase, type FeatureBlock } from "@/components/site/feature-showcase";
import { PricingSection } from "@/components/site/pricing-section";
import { Faq } from "@/components/site/faq";
import { CrmVisual, DeskVisual, SocialVisual, AutomationVisual, AnalyticsVisual } from "@/components/site/visuals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";
import { getCategories, getTrendingTools, getTopRated, getDeals, getIntegrations, getBlogPosts } from "@/lib/data";

const features: FeatureBlock[] = [
  {
    eyebrow: "PEAK CRM", icon: <Database className="h-3.5 w-3.5" />,
    title: "Your entire sales pipeline, in one place", accent: "#22c55e",
    description: "Manage contacts, leads, deals and tasks with a drag-and-drop pipeline. Let AI score your leads and forecast revenue.",
    points: ["Visual drag-and-drop pipeline", "AI lead scoring & forecasting", "Contact timelines, tags & custom fields", "Sales reports and follow-up reminders"],
    cta: { label: "Explore CRM", href: "/dashboard/crm" },
    visual: <CrmVisual />,
  },
  {
    eyebrow: "PEAK DESK", icon: <Headphones className="h-3.5 w-3.5" />,
    title: "Support that feels effortless", accent: "#38bdf8",
    description: "Tickets, live chat, email and a knowledge base — all with an AI assistant that drafts replies for your team.",
    points: ["Unified multi-channel inbox", "Ticket assignment, priorities & SLA", "AI-assisted reply drafting", "Canned replies and knowledge base"],
    cta: { label: "Open Support", href: "/dashboard/support" },
    visual: <DeskVisual />,
  },
  {
    eyebrow: "PEAK SOCIAL", icon: <Share2 className="h-3.5 w-3.5" />,
    title: "Turn social conversations into sales", accent: "#ec4899",
    description: "Connect Instagram, WhatsApp, X and more. Manage a unified inbox, products, orders and social analytics.",
    points: ["Unified inbox across channels", "Order creation & inventory updates", "Product catalogs & customers", "AI replies and social analytics"],
    cta: { label: "Explore Social", href: "/dashboard/social" },
    visual: <SocialVisual />,
  },
  {
    eyebrow: "AUTOMATION", icon: <Workflow className="h-3.5 w-3.5" />,
    title: "Build no-code automations", accent: "#6d00cc",
    description: "WHEN this happens, THEN do that. Drag-and-drop blocks connect your tools and eliminate busywork.",
    points: ["Visual trigger → action builder", "Prebuilt workflow templates", "Connect 1,500+ apps", "Run history and failure alerts"],
    cta: { label: "Open Automation", href: "/dashboard/automation" },
    visual: <AutomationVisual />,
  },
  {
    eyebrow: "ANALYTICS", icon: <BarChart3 className="h-3.5 w-3.5" />,
    title: "See your business in real time", accent: "#16a34a",
    description: "Revenue, orders, customers, retention and sales by channel — with AI insights that tell you what to do next.",
    points: ["Revenue, profit & conversion tracking", "Sales by channel & top products", "AI-generated business insights", "Custom dashboards"],
    cta: { label: "Open Analytics", href: "/dashboard/analytics" },
    visual: <AnalyticsVisual />,
  },
];

const testimonials = [
  { name: "Maya Chen", role: "COO, Halcyon", content: "PEAKLOOP replaced five separate tools for us. We discovered, compared and now manage everything in one place." },
  { name: "Leo Martins", role: "Founder, Northwind", content: "The AI recommendations saved us roughly $47/month on software we weren't even using well. Game changer." },
  { name: "Sofia Reyes", role: "Head of Marketing, Bloom", content: "The automation builder is ridiculously easy. We set up our customer onboarding flow in an afternoon." },
  { name: "Ethan Anders", role: "CFO, Meridian", content: "Tracking spend and renewals finally makes sense. The dashboard is beautiful and genuinely useful." },
];

export default function HomePage() {
  const categories = getCategories().slice(0, 12);
  const trending = getTrendingTools(8);
  const topRated = getTopRated(4);
  const deals = getDeals().slice(0, 4);
  const integrations = getIntegrations().slice(0, 8);
  const posts = getBlogPosts(3);

  return (
    <>
      <Hero />

      {/* Popular categories */}
      <Section>
        <SectionHeading eyebrow="Explore" title="Browse by category" description="From AI to automation — find the tools that fit every part of your business." />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="group flex items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:border-[#bbf7d0] hover:shadow-md">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: c.color }}>
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.toolCount} tools</div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button asChild variant="outline"><Link href="/categories">View all categories <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
      </Section>

      {/* Trending tools */}
      <Section id="trending" className="bg-white">
        <SectionHeading eyebrow="Trending" title="Trending tools this week" description="The software businesses are discovering and adopting right now." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
        <div className="mt-8 text-center">
          <Button asChild><Link href="/tools">Explore all tools <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
      </Section>

      {/* Compare */}
      <Section>
        <SectionHeading eyebrow="Compare" title="Compare tools side by side" description="Stop guessing. Put your shortlist head-to-head and pick a winner with confidence." />
        <div className="mt-10">
          <ComparePromo />
        </div>
      </Section>

      {/* AI recommendation */}
      <Section id="ai" className="bg-gradient-to-b from-white to-[#f0fdf4]">
        <SectionHeading eyebrow="AI Powered" title="Let PEAK AI choose for you" description="Answer three quick questions and get software tailored to your team." />
        <div className="mt-10">
          <AiRecommend />
        </div>
      </Section>

      {/* Dashboard preview */}
      <Section>
        <SectionHeading eyebrow="Command Center" title="Your business, at a glance" description="One dashboard for software spend, savings, CRM, orders and analytics." />
        <div className="mt-10">
          <DashboardPreview />
        </div>
      </Section>

      {/* Product feature showcases */}
      <Section id="product" className="bg-white">
        <div className="space-y-24">
          {features.map((f, i) => <FeatureShowcase key={f.eyebrow} feature={f} reverse={!!(i % 2)} />)}
        </div>
      </Section>

      {/* Integrations */}
      <Section>
        <SectionHeading eyebrow="Integrations" title="Connect your entire stack" description="PEAKLOOP plugs into the tools you already use." />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {integrations.map((ig) => (
            <Link key={ig.slug} href="/dashboard/integrations" className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:border-[#bbf7d0] hover:shadow-md">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: ig.color }}>
                <Icon name={ig.icon} className="h-5 w-5" />
              </span>
              <span className="text-center text-xs font-medium text-slate-600">{ig.name}</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section id="testimonials" className="bg-white">
        <SectionHeading eyebrow="Loved by teams" title="Trusted by businesses that grow" description="Here's what customers say about PEAKLOOP." />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="flex gap-0.5 text-amber-400">{"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}</div>
              <blockquote className="mt-3 flex-1 text-sm text-slate-600">“{t.content}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-xs font-bold text-white">
                  {t.name.split(" ").map((p) => p[0]).join("")}
                </span>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing">
        <SectionHeading eyebrow="Pricing" title="Simple pricing that scales with you" description="Start free. Upgrade when you're ready." />
        <div className="mt-10">
          <PricingSection />
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="bg-white">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-10"><Faq /></div>
      </Section>

      {/* Deals strip */}
      <Section>
        <div className="flex items-center gap-2"><SectionHeading align="left" eyebrow="Deals" title="Limited-time software deals" /></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deals.map((d) => (
            <Link key={d.id} href="/deals" className="group rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:border-[#bbf7d0] hover:shadow-md">
              <span className="inline-block rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-bold text-[#047857]">{d.discount}</span>
              <div className="mt-3 font-semibold">{d.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{d.toolName || d.category}</div>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground line-through">${(d.originalPrice / 100).toFixed(2)}</span>{" "}
                <span className="font-bold text-[#047857]">${(d.currentPrice / 100).toFixed(2)}/mo</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center"><Button asChild variant="outline"><Link href="/deals">See all deals</Link></Button></div>
      </Section>

      {/* Blog */}
      <Section className="bg-white">
        <SectionHeading eyebrow="Blog" title="Guides & insights" description="Learn how to choose and use the best software for your business." />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:shadow-md">
              <div className="h-36 w-full bg-gradient-to-br from-[#d1fadf] to-[#e0f2fe]" />
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary">{p.categoryName || "SaaS"}</Badge><span>{p.author}</span>
                </div>
                <h3 className="mt-2 line-clamp-2 font-semibold group-hover:text-[#047857]">{p.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center"><Button asChild variant="outline"><Link href="/blog">Read the blog <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></div>
      </Section>

      {/* Final CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#134e4a] px-6 py-16 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute inset-0 pl-dot opacity-20" />
          <Sparkles className="mx-auto h-10 w-10 text-[#4ade80]" />
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Reach your peak with PEAKLOOP.</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-300">Everything your business needs. Connected.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" variant="gradient"><Link href="/register">Start Free</Link></Button>
            <Button asChild size="xl" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10"><Link href="/tools">Explore tools</Link></Button>
          </div>
        </div>
      </Section>
    </>
  );
}
