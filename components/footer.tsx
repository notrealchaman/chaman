import { AtSign, MessageCircle, GitBranch, ArrowUpRight } from "lucide-react";

export function Footer() {
  const cols = [
    { title: "Product", links: ["Tools", "Categories", "Compare", "Deals", "Pricing"] },
    { title: "Resources", links: ["Blog", "Trending", "New tools", "Top rated", "Reviews"] },
    { title: "Company", links: ["About", "Careers", "Contact", "Press", "Partners"] },
    { title: "Developers", links: ["API", "Documentation", "Integrations", "Webhooks", "Status"] },
  ];
  const socials = [
    { label: "X", icon: AtSign, href: "https://x.com" },
    { label: "Community", icon: MessageCircle, href: "https://discord.com" },
    { label: "GitHub", icon: GitBranch, href: "https://github.com" },
  ];
  return (
    <footer className="border-t border-slate-800 bg-[#0f172a] text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 text-lg font-bold text-white"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-green-500 text-sm text-white">P</span> PEAKLOOP</div>
            <p className="mt-3 text-sm text-slate-400">The operating system for modern teams.</p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">{c.title}</div>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => <li key={l}><a href="#" className="text-sm text-slate-300 hover:text-white">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 sm:flex-row">
          <div className="flex items-center gap-4">
            {socials.map((s) => (
              <a key={s.label} href={s.href} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:border-white hover:text-white" aria-label={s.label}>
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} PEAKLOOP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
