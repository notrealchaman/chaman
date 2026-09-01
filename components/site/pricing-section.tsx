"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free", monthly: 0, tagline: "For individuals getting started",
    features: ["Browse all tools", "Compare up to 2 tools", "Save favorite tools", "Basic reviews", "Basic alerts"],
    cta: "Start Free",
  },
  {
    name: "Pro", monthly: 9, tagline: "For power users & growing teams", popular: true,
    features: ["Everything in Free", "Unlimited comparisons", "Subscription tracking", "Advanced alerts", "PEAK AI assistant", "Spending analytics"],
    cta: "Start Pro",
  },
  {
    name: "Business", monthly: 29, tagline: "For companies that want to scale",
    features: ["Everything in Pro", "PEAK CRM", "Customer support", "Automation builder", "Business analytics", "Team management", "Integrations"],
    cta: "Start Business",
  },
  {
    name: "Enterprise", monthly: null, tagline: "For large organizations",
    features: ["Unlimited users", "Advanced security", "SSO", "Custom integrations", "Dedicated support", "API", "SLA"],
    cta: "Contact Sales",
  },
];

export function PricingSection() {
  const [yearly, setYearly] = useState(true);
  return (
    <div>
      <div className="flex items-center justify-center gap-2">
        <span className={cn("text-sm", !yearly ? "font-semibold text-foreground" : "text-muted-foreground")}>Monthly</span>
        <button
          onClick={() => setYearly((y) => !y)}
          className="relative inline-flex h-7 w-14 items-center rounded-full bg-slate-200 transition-colors"
          aria-label="Toggle billing period"
        >
          <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", yearly ? "translate-x-8" : "translate-x-1")} />
        </button>
        <span className={cn("text-sm", yearly ? "font-semibold text-foreground" : "text-muted-foreground")}>Yearly</span>
        <span className="ml-1 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-xs font-semibold text-[#047857]">Save 20%</span>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-4">
        {plans.map((plan) => {
          const price = yearly ? Math.round((plan.monthly ?? 0) * 0.8) : plan.monthly;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm",
                plan.popular ? "border-[#22c55e] shadow-lg shadow-[#22c55e]/10 ring-1 ring-[#22c55e]" : "border-border"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#22c55e] to-[#38bdf8] px-3 py-1 text-xs font-bold text-white">MOST POPULAR</span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                {plan.monthly === null ? (
                  <span className="text-3xl font-bold">Custom</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </>
                )}
              </div>
              {yearly && plan.monthly !== null && plan.monthly > 0 && (
                <span className="mt-1 text-xs text-[#16a34a]">billed annually</span>
              )}
              <ul className="mt-6 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />
                    <span className="text-slate-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant={plan.popular ? "default" : "outline"} className="mt-6">
                <Link href={plan.monthly === null ? "/contact" : "/register"}>{plan.cta}</Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
