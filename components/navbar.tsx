"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, Search, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const discoverLinks = [
  { label: "All Tools", href: "/tools" },
  { label: "Categories", href: "/categories" },
  { label: "Trending", href: "/trending" },
  { label: "Top Rated", href: "/top-rated" },
  { label: "New Tools", href: "/new-tools" },
  { label: "Deals", href: "/deals" },
  { label: "Compare", href: "/compare" },
];
const businessLinks = [
  { label: "Dashboard", href: "/dashboard/overview" },
  { label: "CRM", href: "/dashboard/crm" },
  { label: "Social Commerce", href: "/dashboard/social" },
  { label: "Support", href: "/dashboard/support" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Automation", href: "/dashboard/automation" },
];
const resourceLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Guides", href: "/blog/automation-for-startups" },
  { label: "API", href: "/dashboard/api" },
  { label: "Help Center", href: "/dashboard/support" },
];

type NavItem = { label: string; href: string };
type Menu = { label: string; items: NavItem[] };

const menus: Menu[] = [
  { label: "Discover", items: discoverLinks },
  { label: "Business", items: businessLinks },
  { label: "Resources", items: resourceLinks },
];

export function Navbar({ isLoggedIn = false, onOpenSearch }: { isLoggedIn?: boolean; onOpenSearch?: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header className={cn("sticky top-0 z-40 w-full transition-all", scrolled || !isHome ? "bg-white/90 backdrop-blur border-b border-border shadow-sm" : "bg-transparent")}>
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-[#22c55e] to-[#38bdf8] text-white text-center text-xs sm:text-sm py-2 px-4 font-medium">
        <Link href="/deals" className="inline-flex items-center gap-1 hover:underline">
          New: Get 40% off PEAK CRM for your first year — limited time <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="PEAKLOOP home">
            <Logo />
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {menus.map((menu) => (
              <DropdownNav key={menu.label} menu={menu} />
            ))}
            <Link href="/pricing" className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-foreground hover:bg-slate-50">
              Pricing
            </Link>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={onOpenSearch}
            className="hidden items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm text-muted-foreground shadow-sm hover:bg-slate-50 lg:flex"
          >
            <Search className="h-4 w-4" />
            <span>Search tools…</span>
            <kbd className="rounded border bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">⌘K</kbd>
          </button>
          {isLoggedIn ? (
            <Button asChild>
              <Link href="/dashboard/overview">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-foreground">
                Login
              </Link>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={onOpenSearch} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            {menus.map((menu) => (
              <div key={menu.label} className="mb-2">
                <button
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-slate-50"
                  onClick={() => setMobileMenu(mobileMenu === menu.label ? null : menu.label)}
                >
                  {menu.label}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", mobileMenu === menu.label && "rotate-180")} />
                </button>
                {mobileMenu === menu.label && (
                  <div className="ml-3 space-y-1 border-l border-border pl-3">
                    {menu.items.map((it) => (
                      <Link key={it.href} href={it.href} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
                        {it.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link href="/pricing" className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={() => setOpen(false)}>
              Pricing
            </Link>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4">
              {isLoggedIn ? (
                <Button asChild className="col-span-2">
                  <Link href="/dashboard/overview">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownNav({ menu }: { menu: Menu }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-foreground hover:bg-slate-50">
        {menu.label}
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>
      {hover && (
        <div className="absolute left-0 top-full z-50 w-60 rounded-xl border border-border bg-white p-1.5 shadow-xl">
          {menu.items.map((it) => (
            <Link key={it.href} href={it.href} className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-foreground">
              {it.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
