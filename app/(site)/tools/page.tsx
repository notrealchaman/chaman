import { Suspense } from "react";
import Link from "next/link";
import { ToolCard } from "@/components/tool-card";
import { ToolsFilterSidebar } from "@/components/tools-filter-sidebar";
import { ToolsSort } from "@/components/tools-sort";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getTools, getCategories } from "@/lib/data";

export const metadata = { title: "Browse Software Tools | PEAKLOOP", description: "Discover, compare and choose the best software tools for your business." };
export const dynamic = "force-dynamic";

const perPage = 24;

export default async function ToolsPage({ searchParams }: { searchParams: Promise<{ [k: string]: string | undefined }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const category = sp.category || "";
  const sort = sp.sort || "recommended";
  const price = sp.price || "";
  const freePlan = sp.freePlan === "1";
  const freeTrial = sp.freeTrial === "1";
  const ai = sp.ai === "1";
  const minRating = sp.minRating ? Number(sp.minRating) : undefined;
  const page = Number(sp.page || 1);

  const { tools, total } = getTools({ q, category, sort, price, freePlan, freeTrial, ai, minRating, page, perPage });
  const categories = getCategories();
  const totalPages = Math.ceil(total / perPage);

  const active = { q, category, sort, price, freePlan: freePlan ? "1" : "", freeTrial: freeTrial ? "1" : "", ai: ai ? "1" : "", minRating: sp.minRating || "" };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">Explore Tools</h1>
        <p className="mt-2 text-muted-foreground">{total.toLocaleString()} tools found{q && ` for “${q}”`}{category ? ` in ${categories.find((c) => c.slug === category)?.name}` : ""}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
          <ToolsFilterSidebar categories={categories.map((c) => ({ slug: c.slug, name: c.name, toolCount: c.toolCount ?? 0 }))} active={active} />
        </Suspense>

        <div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total.toLocaleString()}</div>
            <Suspense fallback={<Skeleton className="h-10 w-40" />}><ToolsSort /></Suspense>
          </div>

          {tools.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
              <p className="font-medium">No tools found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1;
                const activePage = p === page;
                return (
                  <Link
                    key={p}
                    href={`/tools?${new URLSearchParams({ ...(q ? { q } : {}), ...(category ? { category } : {}), ...(sort !== "recommended" ? { sort } : {}), page: String(p) }).toString()}`}
                    className={activePage ? "rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white" : "rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"}
                  >
                    {p}
                  </Link>
                );
              })}
              {totalPages > 7 && <span className="text-sm text-muted-foreground">…</span>}
              {page > 1 && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/tools?${new URLSearchParams({ ...(q ? { q } : {}), ...(category ? { category } : {}), ...(sort !== "recommended" ? { sort } : {}), page: String(page - 1) }).toString()}`}>Prev</Link>
                </Button>
              )}
              {page < totalPages && (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/tools?${new URLSearchParams({ ...(q ? { q } : {}), ...(category ? { category } : {}), ...(sort !== "recommended" ? { sort } : {}), page: String(page + 1) }).toString()}`}>Next</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
