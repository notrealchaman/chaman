import { CompareWorkspace } from "@/components/compare-workspace";
import { Section, SectionHeading } from "@/components/site/section";

export const metadata = { title: "Compare Software | PEAKLOOP", description: "Compare up to 4 software tools side by side and find the best fit for your business." };
export const dynamic = "force-dynamic";

export default function ComparePage() {
  return (
    <Section>
      <SectionHeading eyebrow="Compare" title="Compare tools" description="Select up to 4 tools from any card and compare them side by side." />
      <div className="mt-10"><CompareWorkspace /></div>
    </Section>
  );
}
