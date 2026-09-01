import { cn } from "@/lib/utils";

export function ToolIcon({
  name,
  logo,
  color,
  className,
  size = "md",
}: {
  name: string;
  logo?: string | null;
  color?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const dims = {
    sm: "h-8 w-8 rounded-lg text-xs",
    md: "h-10 w-10 rounded-xl text-sm",
    lg: "h-14 w-14 rounded-2xl text-base",
    xl: "h-20 w-20 rounded-[1.5rem] text-2xl",
  }[size];
  const bg = color || "#22c55e";
  const label = (logo || name).replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || name[0] || "P";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-bold text-white shadow-sm",
        dims,
        className
      )}
      style={{ background: `linear-gradient(135deg, ${bg}, ${shade(bg)})` }}
      aria-hidden
    >
      {label}
    </span>
  );
}

function shade(hex: string) {
  try {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;
    r = Math.min(255, Math.round(r * 0.7));
    g = Math.min(255, Math.round(g * 0.72));
    b = Math.min(255, Math.round(b * 0.7));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return "#16a34a";
  }
}
