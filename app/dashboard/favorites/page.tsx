import { Heart } from "lucide-react";

import { getFavoriteTools } from "@/lib/data";

import { requireUser } from "@/lib/session";
import { ToolCard } from "@/components/tool-card";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
    const { id: userId } = await requireUser();
  const saved = getFavoriteTools(userId);

  return (
    <div>
      <PageHeader eyebrow="Saved" title="Favorites" description="Tools you've saved to revisit and compare." />
      {saved.length === 0 ? (
        <EmptyState icon={<Heart className="h-6 w-6" />} title="No favorites yet" description="Save tools you love with the heart icon on any tool card." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{saved.map((t) => <ToolCard key={t.slug} tool={t} savedInitial />)}</div>
      )}
    </div>
  );
}
