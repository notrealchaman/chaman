import { getTrendingTools } from "@/lib/data";
import { ToolCard } from "@/components/tool-card";
import { Section, SectionHeading } from "@/components/site/section";

export const metadata = { title: "Trending Software Tools | PEAKLOOP", description: "The fastest-rising software tools businesses are discovering right now." };
export const dynamic = "force-dynamic";

export default function TrendingPage() {
  const tools = getTrendingTools(48);
  return (
    <Section>
      <SectionHeading eyebrow="Trending" title="Trending now" description="The software most businesses are discovering and adopting this week." />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
      </div>
    </Section>
  );
}
