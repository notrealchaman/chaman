import { Sparkles, Database, Share2, Workflow, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Section, SectionHeading } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { FeatureShowcase, type FeatureBlock } from "@/components/site/feature-showcase";
import { CrmVisual, DeskVisual, SocialVisual, AutomationVisual, AnalyticsVisual } from "@/components/site/visuals";

export const metadata = { title: "About PEAKLOOP", description: "PEAKLOOP is the operating system for modern businesses." };

const features: FeatureBlock[] = [
  { eyebrow: "Our mission", icon: <Sparkles className="h-3.5 w-3.5" />, title: "Make every business run on software that fits", description: "We believe the best tools should be easy to discover and effortless to manage. We're building the platform where that happens.", points: ["Discover thousands of tools", "Compare before you commit", "Automate without code"], cta: { label: "Explore tools", href: "/tools" }, visual: <CrmVisual /> },
  { eyebrow: "Built for teams", icon: <Workflow className="h-3.5 w-3.5" />, title: "One platform. Every function.", description: "CRM, support, social commerce, analytics and automation — connected in one place.", points: ["PEAK CRM & PEAK Desk", "PEAK Social & PEAK Analytics", "Visual automation builder"], cta: { label: "See it in action", href: "/dashboard/overview" }, visual: <AutomationVisual /> },
];

const values = [
  { title: "Clarity", desc: "We make choosing software simple and transparent." },
  { title: "Craft", desc: "Every screen is designed with care and intention." },
  { title: "Impact", desc: "We help businesses save money and grow faster." },
  { title: "Trust", desc: "Verified reviews and honest comparisons." },
];

export default function AboutPage() {
  return (
    <>
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <Logo markClassName="h-14 w-14" />
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">The operating system for <span className="text-gradient-pl">modern businesses</span>.</h1>
          <p className="mt-4 text-lg text-muted-foreground">PEAKLOOP helps you discover, compare, choose and manage the software that powers your company — then connects it all with built-in CRM, support, analytics and automation.</p>
        </div>
      </Section>
      <Section className="bg-white">
        <div className="space-y-20">
          {features.map((f, i) => <FeatureShowcase key={f.eyebrow} feature={f} reverse={!!(i % 2)} />)}
        </div>
      </Section>
      <Section>
        <SectionHeading title="What we value" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#16a34a]"><Sparkles className="h-5 w-5" /></div>
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section className="bg-white">
        <div className="rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#134e4a] px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to reach your peak?</h2>
          <Button asChild size="xl" variant="gradient" className="mt-6"><Link href="/register">Start Free <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
      </Section>
    </>
  );
}
