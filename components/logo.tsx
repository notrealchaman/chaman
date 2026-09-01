import { cn } from "@/lib/utils";

/**
 * PEAKLOOP logo — a mountain/peak mark fused with a continuous loop.
 * Designed to work as an app icon, favicon, and social avatar.
 */
export function PeakMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-white shadow-sm",
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        className="h-2/3 w-2/3"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Peak */}
        <path d="M8 33 L18 15 L24 24 L30 15 L40 33" />
        {/* Loop */}
        <path d="M13 33 C 17 39, 31 39, 35 33 C 37.5 29.5, 36 26, 33 24.5" />
      </svg>
    </span>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <PeakMark className={markClassName ?? "h-8 w-8"} />
      <span className="font-bold tracking-tight text-[var(--pl-dark)]">
        PEAK<span className="text-gradient-pl">LOOP</span>
      </span>
    </span>
  );
}
