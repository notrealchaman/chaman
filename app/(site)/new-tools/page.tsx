import { getNewTools } from "@/lib/data";
import { ToolCard } from "@/components/tool-card";
import { Section, SectionHeading } from "@/components/site/section";

export const metadata = { title: "New Software Tools | PEAKLOOP", description: "The newest software tools and AI products added to PEAKLOOP." };
export const dynamic = "force-dynamic";

export default function NewToolsPage() {
  const tools = getNewTools(48);
  return (
    <Section>
      <SectionHeading eyebrow="New" title="Recently added tools" description="Fresh software products discovered by the PEAKLOOP team." />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
      </div>
    </Section>
  );
}
