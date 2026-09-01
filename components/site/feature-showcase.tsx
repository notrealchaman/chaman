import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface FeatureBlock {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  cta: { label: string; href: string };
  icon: React.ReactNode;
  accent?: string;
  visual: React.ReactNode;
}

export function FeatureShowcase({ feature, reverse = false }: { feature: FeatureBlock; reverse?: boolean }) {
  return (
    <div className={cn("grid items-center gap-10 lg:grid-cols-2")}>
      <div className={cn(reverse && "lg:order-2")}>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#047857]">
          {feature.icon} {feature.eyebrow}
        </span>
        <h3 className="mt-4 text-3xl font-bold tracking-tight text-[#0f172a]">{feature.title}</h3>
        <p className="mt-3 text-lg text-muted-foreground">{feature.description}</p>
        <ul className="mt-6 space-y-2.5">
          {feature.points.map((p) => (
            <li key={p} className="flex items-start gap-2 text-slate-600">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" /> {p}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-7">
          <Link href={feature.cta.href}>{feature.cta.label} <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
      <div className={cn(reverse && "lg:order-1")}>{feature.visual}</div>
    </div>
  );
}
