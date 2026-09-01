"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CommandMenu } from "@/components/command-menu";

export function AppShell({ children, noFooter = false }: { children: React.ReactNode; noFooter?: boolean }) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isLoggedIn={!!session?.user} onOpenSearch={() => setOpen(true)} />
      <main className="flex-1">{children}</main>
      {!noFooter && <Footer />}
      <CommandMenu open={open} onOpenChange={setOpen} />
    </div>
  );
}
