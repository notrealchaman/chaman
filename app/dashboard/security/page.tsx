import { Shield, ShieldCheck, Smartphone, KeyRound, History } from "lucide-react";

import { get } from "@/lib/db";
import { all } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TwoFactorToggle } from "@/components/dashboard/two-factor-toggle";
import { getAdminReviews } from "@/lib/data";

import { requireUser } from "@/lib/session";
import { formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

function SecurityScore() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#38bdf8] p-6 text-white">
      <ShieldCheck className="h-10 w-10" />
      <div>
        <div className="text-sm font-medium opacity-90">Your account security</div>
        <div className="text-3xl font-bold">Excellent</div>
      </div>
    </div>
  );
}

export default async function SecurityPage() {
    const { id: userId, email } = await requireUser();
  const user = get<{ twoFactorEnabled: number; emailVerified: string | null }>(`SELECT twoFactorEnabled, emailVerified FROM "User" WHERE id = ?`, [userId]);
  const audit = all<{ action: string; entity: string; createdAt: string }>(`SELECT action, entity, createdAt FROM "AuditLog" WHERE userId = ? ORDER BY createdAt DESC LIMIT 8`, [userId]);

  return (
    <div>
      <PageHeader eyebrow="Security" title="Security" description="Protect your account and review activity." />
      <SecurityScore />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#16a34a]"><Shield className="h-5 w-5" /></span>
              <div>
                <div className="font-semibold">Two-factor authentication</div>
                <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
              </div>
            </div>
            <TwoFactorToggle initial={!!user?.twoFactorEnabled} />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Smartphone className="h-5 w-5" /></span>
              <div>
                <div className="font-semibold">Devices</div>
                <div className="text-sm text-muted-foreground">Sessions and trust</div>
              </div>
            </div>
            <Badge variant="success">1 active</Badge>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2 font-semibold"><KeyRound className="h-4 w-4" /> Authentication</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email verified</span><span className="font-medium">{user?.emailVerified ? formatDate(user.emailVerified) : "No"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Sign-in method</span><span className="font-medium">Password</span></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 font-semibold"><History className="h-4 w-4" /> Recent activity</div>
          <div className="mt-4 space-y-2.5">
            {audit.length === 0 && <div className="text-sm text-muted-foreground">No recent activity.</div>}
            {audit.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-medium">{a.action}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
