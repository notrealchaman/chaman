"use client";

import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CompareProvider } from "@/components/compare-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CompareProvider>
        <TooltipProvider delayDuration={100}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
              },
            }}
          />
        </TooltipProvider>
      </CompareProvider>
    </SessionProvider>
  );
}
