import { getTopRated } from "@/lib/data";
import { ToolCard } from "@/components/tool-card";
import { Section, SectionHeading } from "@/components/site/section";

export const metadata = { title: "Top Rated Software | PEAKLOOP", description: "The highest-rated software tools verified by real user reviews." };
export const dynamic = "force-dynamic";

export default function TopRatedPage() {
  const tools = getTopRated(48);
  return (
    <Section>
      <SectionHeading eyebrow="Top Rated" title="Highest rated tools" description="The best-reviewed software on PEAKLOOP, ranked by real users." />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
      </div>
    </Section>
  );
}
