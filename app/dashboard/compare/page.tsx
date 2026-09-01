import { CompareWorkspace } from "@/components/compare-workspace";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default function DashboardComparePage() {
  return (
    <div>
      <PageHeader eyebrow="Compare" title="Tool Comparison" description="Compare up to 4 tools and build your shortlist." />
      <CompareWorkspace />
    </div>
  );
}
