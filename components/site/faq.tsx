"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "What is PEAKLOOP?", a: "PEAKLOOP is the operating system for modern businesses. Discover, compare and manage the software that powers your company — all from one intelligent platform with built-in CRM, support, analytics and automation." },
  { q: "Is PEAKLOOP free to use?", a: "Yes. Our Free plan lets you browse thousands of tools, compare and save favorites. Pro and Business plans unlock subscription tracking, PEAK AI, CRM and automation." },
  { q: "How does the AI assistant work?", a: "PEAK AI analyzes your team size, budget, industry and current tools to recommend the best software, find cheaper alternatives, and even build workflows and answer business questions." },
  { q: "Can I track my subscription spend?", a: "Absolutely. Connect your SaaS subscriptions and PEAKLOOP surfaces your monthly and annual spend, renewal reminders and AI suggestions to cut costs." },
  { q: "Is my data secure?", a: "Security is foundational. We support two-factor authentication, role-based access control, session management and granular permissions. Your account security score is always visible in your dashboard." },
  { q: "How do I list my software on PEAKLOOP?", a: "Software vendors can submit a listing from the vendor portal. Our team reviews and approves every listing before it goes live, ensuring quality and verified reviews." },
  { q: "Does PEAKLOOP work for enterprise teams?", a: "Yes. Enterprise plans include unlimited users, SSO, advanced security, custom integrations, a dedicated API and SLA-backed support." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-white">
      {faqs.map((f, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            aria-expanded={open === i}
          >
            <span className="font-medium">{f.q}</span>
            <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", open === i && "rotate-180")} />
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}
