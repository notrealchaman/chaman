"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

interface CompareContextValue {
  slugs: string[];
  toggle: (slug: string) => void;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);
const KEY = "peakloop.compare";

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSlugs(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setSlugs(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      const exists = slugs.includes(slug);
      let next: string[];
      if (exists) {
        next = slugs.filter((s) => s !== slug);
        toast.info("Removed from comparison");
      } else {
        if (slugs.length >= 4) {
          toast.error("You can compare up to 4 tools at once");
          return;
        }
        next = [...slugs, slug];
        toast.success("Added to comparison");
      }
      persist(next);
    },
    [slugs, persist]
  );

  const add = useCallback(
    (slug: string) => {
      if (!slugs.includes(slug)) {
        if (slugs.length >= 4) {
          toast.error("You can compare up to 4 tools at once");
          return;
        }
        persist([...slugs, slug]);
        toast.success("Added to comparison");
      }
    },
    [slugs, persist]
  );

  const remove = useCallback((slug: string) => persist(slugs.filter((s) => s !== slug)), [slugs, persist]);
  const clear = useCallback(() => persist([]), [persist]);
  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return (
    <CompareContext.Provider value={{ slugs, toggle, add, remove, clear, has }}>
      <div className={loaded ? "" : ""}>{children}</div>
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
