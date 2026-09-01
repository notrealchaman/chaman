import { Check, CircleDollarSign, Sparkles } from "lucide-react";

export function CrmVisual() {
  const cols = [
    { label: "Lead", color: "#94a3b8", cards: ["Acme Inc", "Lumina", "Northwind"] },
    { label: "Qualified", color: "#38bdf8", cards: ["Vertex", "Halcyon"] },
    { label: "Proposal", color: "#22c55e", cards: ["Cobalt", "Atlas"] },
    { label: "Won", color: "#10b981", cards: ["Nimbus"] },
  ];
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold">Sales pipeline</div>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-600"><Sparkles className="h-3 w-3" /> AI scoring</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cols.map((c) => (
          <div key={c.label} className="rounded-xl bg-slate-50 p-2.5">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
              <span className="text-xs font-semibold text-slate-600">{c.label}</span>
            </div>
            <div className="space-y-2">
              {c.cards.map((card) => (
                <div key={card} className="rounded-lg border border-border bg-white p-2.5 shadow-sm">
                  <div className="text-xs font-medium">{card}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">${(Math.round((Math.random() * 8) + 2) * 1000).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeskVisual() {
  const tickets = [
    { subject: "Cannot connect Stripe account", tag: "payments", color: "#f59e0b", status: "Open" },
    { subject: "Export CRM contacts", tag: "crm", color: "#38bdf8", status: "In progress" },
    { subject: "Login issues after reset", tag: "auth", color: "#ef4444", status: "Resolved" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold">Support inbox</div>
        <span className="rounded-full bg-[#ecfdf5] px-2 py-1 text-xs font-semibold text-[#047857]">SLA 4h</span>
      </div>
      <div className="space-y-2.5">
        {tickets.map((t) => (
          <div key={t.subject} className="flex items-center justify-between rounded-xl border border-border bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }} />
              <div>
                <div className="text-xs font-medium">{t.subject}</div>
                <span className="text-[10px] text-muted-foreground">#{Math.floor(Math.random() * 9000 + 1000)} · {t.tag}</span>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{t.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-violet-50 p-3 text-xs text-violet-700">
        <Sparkles className="mr-1 inline h-3 w-3" /> PEAK AI drafted a reply for the open ticket.
      </div>
    </div>
  );
}

export function SocialVisual() {
  const msgs = [
    { from: "customer", text: "I want 2 blue shirts." },
    { from: "ai", text: "Sure! 2 blue shirts are $40. Would you like to place the order?" },
    { from: "customer", text: "Yes, please." },
    { from: "system", text: "✓ Order created · ✓ Inventory updated · ✓ Confirmation sent" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold">Instagram DM — @peakworks</div>
      <div className="space-y-2.5">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.from === "system"
                ? "rounded-lg bg-[#ecfdf5] p-2.5 text-xs font-medium text-[#047857]"
                : `max-w-[80%] rounded-2xl p-2.5 text-xs shadow-sm ${m.from === "customer" ? "bg-slate-100 text-slate-700" : "bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-white"}`
            }
          >
            {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AutomationVisual() {
  const nodes = [
    { label: "WHEN", value: "New customer created", color: "#38bdf8" },
    { label: "THEN", value: "Add customer to CRM", color: "#22c55e" },
    { label: "THEN", value: "Send welcome email", color: "#22c55e" },
    { label: "THEN", value: "Create follow-up task", color: "#22c55e" },
    { label: "THEN", value: "Notify sales team", color: "#22c55e" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 text-sm font-semibold">Automation builder</div>
      <div className="flex flex-col items-start gap-2">
        {nodes.map((n, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`mt-1 inline-flex h-10 w-16 items-center justify-center rounded-lg text-[10px] font-bold text-white ${n.color === "#38bdf8" ? "bg-[#38bdf8]" : "bg-[#22c55e]"}`}>{n.label}</span>
            <div className="rounded-lg border border-border bg-slate-50 px-3 py-2 text-xs font-medium shadow-sm">{n.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsVisual() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 text-sm font-semibold">Business analytics</div>
      <div className="mb-3 grid grid-cols-3 gap-3">
        {[
          { label: "Revenue", value: "$48.2k" },
          { label: "Orders", value: "1,204" },
          { label: "Conversion", value: "4.6%" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-slate-50 p-3">
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
            <div className="text-base font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-2 rounded-xl bg-[#f0fdf4] p-3">
        {[40, 55, 45, 62, 70, 58, 82, 90, 78, 96, 88, 100].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#22c55e]/40 to-[#22c55e]" style={{ height: `${h * 0.5}%`, minHeight: "10px" }} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-violet-50 p-2.5 text-xs text-violet-700">
        <Sparkles className="h-3.5 w-3.5" /> Your highest-converting channel is Instagram.
      </div>
    </div>
  );
}
