import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number, opts?: { compact?: boolean }) {
  // amount in cents
  const value = amount / 100;
  if (opts?.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatDate(date?: string | Date | null, opts?: Intl.DateTimeFormatOptions) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(d);
}

export function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const tiers: [number, string][] = [
    [60, "just now"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2629743, "week"],
    [31556926, "month"],
  ];
  for (let i = 0; i < tiers.length; i++) {
    const [limit, unit] = tiers[i];
    if (seconds < limit) {
      if (i === 0) return "just now";
      const prev = tiers[i - 1][0];
      const n = Math.round(seconds / prev);
      return `${n} ${unit}${n > 1 ? "s" : ""} ago`;
    }
  }
  return formatDate(d);
}

export function relativeDays(date?: string | Date | null) {
  if (!date) return 0;
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pluralize(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

export function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
