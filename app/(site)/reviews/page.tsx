import Link from "next/link";
import { getRecentReviews } from "@/lib/data";
import { StarRating } from "@/components/shared/star-rating";
import { ToolIcon } from "@/components/shared/tool-icon";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/site/section";

export const metadata = { title: "Verified Software Reviews | PEAKLOOP", description: "Read verified reviews from real businesses using software across every category." };
export const dynamic = "force-dynamic";

export default function ReviewsPage() {
  const reviews = getRecentReviews(24);
  return (
    <Section>
      <SectionHeading eyebrow="Reviews" title="Verified reviews from real teams" description="See why businesses choose the tools they do." />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <div key={r.id} className="flex flex-col rounded-xl border border-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Link href={`/tools/${r.toolSlug}`} className="flex items-center gap-2.5">
                <ToolIcon name={r.toolName || ""} logo={r.toolLogo} color={r.toolColor} size="md" />
                <span className="font-medium">{r.toolName || "Tool"}</span>
              </Link>
              {r.verified && <Badge variant="success">Verified</Badge>}
            </div>
            <StarRating rating={r.rating} className="mt-3" />
            <h3 className="mt-2 font-semibold">{r.title}</h3>
            <p className="mt-1 flex-1 line-clamp-3 text-sm text-muted-foreground">{r.content}</p>
            <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              {r.user?.name} · {r.useCase} · {timeAgo(r.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
