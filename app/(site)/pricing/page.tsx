import { PricingSection } from "@/components/site/pricing-section";
import { Section, SectionHeading } from "@/components/site/section";
import { Faq } from "@/components/site/faq";
import { Check } from "lucide-react";

export const metadata = { title: "Pricing | PEAKLOOP", description: "Simple, transparent pricing that scales with your business." };

const included = [
  "Unlimited tool browsing & search",
  "Powerful comparison tool",
  "PEAK AI assistant for recommendations",
  "Subscription tracking & savings insights",
  "Built-in CRM, support, analytics & automation",
];

export default function PricingPage() {
  return (
    <>
      <Section>
        <SectionHeading eyebrow="Pricing" title="Start free. Scale when ready." description="Simple, transparent pricing. No hidden fees, cancel anytime." />
        <div className="mt-12"><PricingSection /></div>
      </Section>
      <Section className="bg-white">
        <div className="mx-auto max-w-3xl">
          <SectionHeading title="Everything included in every plan" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {included.map((i) => (
              <li key={i} className="flex items-start gap-2 text-slate-600"><Check className="mt-0.5 h-5 w-5 text-[#16a34a]" /> {i}</li>
            ))}
          </ul>
        </div>
      </Section>
      <Section>
        <SectionHeading title="Questions about pricing?" />
        <div className="mt-8"><Faq /></div>
      </Section>
    </>
  );
}
