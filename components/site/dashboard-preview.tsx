import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Revenue Overview</h3>
          <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-semibold text-[#047857]">+18% this month</span>
        </div>
        <div className="mt-6 flex items-end gap-2">
          {[35, 48, 42, 60, 55, 72, 80, 68, 90, 84, 100, 96].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-[#22c55e]/30 to-[#22c55e]" style={{ height: `${h}%`, minHeight: "12px" }} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {[
          { icon: DollarSign, label: "Monthly revenue", value: "$48,200", delta: "+18%" },
          { icon: Users, label: "Active customers", value: "1,248", delta: "+6%" },
          { icon: TrendingUp, label: "Conversion rate", value: "4.6%", delta: "+0.8%" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#16a34a]"><s.icon className="h-5 w-5" /></span>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-lg font-bold">{s.value}</div>
            </div>
            <span className="text-xs font-semibold text-[#16a34a]">{s.delta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
