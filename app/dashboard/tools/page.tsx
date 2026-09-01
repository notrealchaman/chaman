
import { getTools, getSavedToolIds } from "@/lib/data";

import { requireUser } from "@/lib/session";
import { ToolsSearchGrid } from "@/components/dashboard/tools-search";
import { PageHeader } from "@/components/dashboard/ui";
export const dynamic = "force-dynamic";

export default async function DashboardToolsPage() {
    const { id: userId } = await requireUser();
  const { tools } = getTools({ perPage: 60, sort: "recommended" });
  const savedIds = getSavedToolIds(userId);

  return (
    <div>
      <PageHeader eyebrow="Tools" title="My Tools" description="Search and manage the software in your stack." />
      <ToolsSearchGrid tools={tools} savedIds={savedIds} />
    </div>
  );
}
