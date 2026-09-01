"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Boxes, Heart, CreditCard, GitCompareArrows, BellRing,
  ReceiptText, Users, Shield, Settings, Database, ShoppingBag, Package,
  Headphones, Share2, BarChart3, Workflow, Plug, KeyRound, Bell, ChevronsUpDown,
  LogOut, Search, Menu, X, Home, Compass, LayoutGrid, User,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, initials } from "@/lib/utils";
import { signOut } from "next-auth/react";

type Item = { label: string; href: string; icon: any };
type Group = { label: string; items: Item[] };

const groups: Group[] = [
  { label: "Overview", items: [{ label: "Command Center", href: "/dashboard/overview", icon: LayoutDashboard }] },
  {
    label: "Manage",
    items: [
      { label: "My Tools", href: "/dashboard/tools", icon: Boxes },
      { label: "Favorites", href: "/dashboard/favorites", icon: Heart },
      { label: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
      { label: "Compare", href: "/dashboard/compare", icon: GitCompareArrows },
      { label: "Alerts", href: "/dashboard/alerts", icon: BellRing },
      { label: "Billing", href: "/dashboard/billing", icon: ReceiptText },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "CRM", href: "/dashboard/crm", icon: Database },
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
      { label: "Customers", href: "/dashboard/customers", icon: Users },
      { label: "Products", href: "/dashboard/products", icon: Package },
      { label: "Support", href: "/dashboard/support", icon: Headphones },
      { label: "Social", href: "/dashboard/social", icon: Share2 },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Automation", href: "/dashboard/automations", icon: Workflow },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Integrations", href: "/dashboard/integrations", icon: Plug },
      { label: "API Keys", href: "/dashboard/integrations", icon: KeyRound },
      { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { label: "Team", href: "/dashboard/team", icon: Users },
      { label: "Security", href: "/dashboard/security", icon: Shield },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

const bottomNav = [
  { label: "Home", href: "/", icon: Home },
  { label: "Discover", href: "/tools", icon: Compass },
  { label: "Compare", href: "/compare", icon: GitCompareArrows },
  { label: "Dashboard", href: "/dashboard/overview", icon: LayoutGrid },
  { label: "Profile", href: "/dashboard/settings", icon: User },
];

export function DashboardShell({
  user,
  unread = 0,
  children,
}: {
  user: { name?: string | null; email?: string | null; role?: string; image?: string | null };
  unread?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/dashboard/overview"><Logo /></Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((g) => (
            <div key={g.label} className="mb-4">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</div>
              <div className="space-y-0.5">
                {g.items.map((it) => {
                  const active = pathname === it.href;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-[#ecfdf5] text-[#047857]" : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
                      )}
                    >
                      <it.icon className="h-4 w-4" />
                      {it.label}
                      {it.href === "/dashboard/notifications" && unread > 0 && (
                        <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile top + bottom nav */}
      <div className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white px-4">
        <Link href="/dashboard/overview"><Logo markClassName="h-7 w-7" /></Link>
        <button onClick={() => setMobileNav((v) => !v)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Toggle nav">
          {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileNav && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setMobileNav(false)} />
      )}
      {mobileNav && (
        <div className="lg:hidden fixed inset-x-0 top-14 bottom-0 z-30 overflow-y-auto bg-white px-4 py-4">
          {groups.map((g) => (
            <div key={g.label} className="mb-3">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</div>
              {g.items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setMobileNav(false)}
                  className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium", pathname === it.href ? "bg-[#ecfdf5] text-[#047857]" : "text-slate-600")}
                >
                  <it.icon className="h-4 w-4" /> {it.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="hidden lg:block text-sm text-muted-foreground">PEAKLOOP Command Center</div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => router.push("/tools")}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm text-muted-foreground shadow-sm hover:bg-slate-50"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">Search tools…</span>
              <kbd className="rounded border bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">⌘K</kbd>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  {unread > 0 ? `${unread} unread notifications` : "You're all caught up"}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")}>View all</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-white">{initials(user.name || user.email)}</AvatarFallback>
                  </Avatar>
                  <ChevronsUpDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm font-semibold">{user.name || "User"}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/security")}>Security</DropdownMenuItem>
                {user.role === "ADMIN" && <DropdownMenuItem onClick={() => router.push("/admin")}>Admin Panel</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600">
                  <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-border bg-white">
        {bottomNav.map((it) => {
          const active = pathname === it.href || (it.href === "/dashboard/overview" && pathname.startsWith("/dashboard"));
          return (
            <Link
              key={it.label}
              href={it.href}
              className={cn("flex flex-col items-center gap-1 px-3 py-2 text-[10px] font-medium", active ? "text-[#16a34a]" : "text-slate-500")}
            >
              <it.icon className="h-5 w-5" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="h-16 lg:hidden" />
    </div>
  );
}
