"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const popular = ["AI Tools", "CRM", "Project Management", "Marketing", "SEO", "E-commerce", "Developer Tools", "Finance"];

const trust = [
  { value: "50K+", label: "businesses" },
  { value: "10K+", label: "tools" },
  { value: "150+", label: "categories" },
  { value: "Verified", label: "reviews" },
];

export function Hero() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <section className="relative overflow-hidden">
      {/* backdrops */}
      <div className="pointer-events-none absolute inset-0 pl-grid opacity-70" />
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-[#d1fadf]/50 blur-3xl" />
      <div className="pointer-events-none absolute -top-20 left-0 h-72 w-72 rounded-full bg-[#e0f2fe]/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#bbf7d0] bg-white px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#047857] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> THE BUSINESS SOFTWARE PLATFORM
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-[#0f172a] sm:text-5xl lg:text-6xl">
            Find the right tools. Connect your business.{" "}
            <span className="text-gradient-pl">Reach your peak.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-muted-foreground">
            Discover, compare and manage the software that powers your business—all from one intelligent platform.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => { e.preventDefault(); router.push(`/tools?q=${encodeURIComponent(q)}`); }}
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-border bg-white p-2 shadow-lg shadow-slate-200/50"
            role="search"
          >
            <Search className="ml-2 h-5 w-5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for software, AI tools, CRM, marketing, accounting…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search software"
            />
            <Button type="submit" size="sm" className="rounded-lg">Search</Button>
          </form>

          {/* Popular searches */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {popular.map((p) => (
              <button
                key={p}
                onClick={() => router.push(`/tools?q=${encodeURIComponent(p)}`)}
                className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-[#bbf7d0] hover:text-[#047857]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/tools">Explore Tools <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/compare">Compare Software</Link>
            </Button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {trust.map((t) => (
            <div key={t.label} className="flex flex-col items-center rounded-xl border border-border bg-white/70 px-4 py-4 text-center backdrop-blur">
              <span className="text-2xl font-bold text-[#0f172a]">{t.value}</span>
              <span className="mt-0.5 text-xs text-muted-foreground">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
