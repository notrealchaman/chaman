"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, User, Building2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [accountType, setAccountType] = useState<"PERSONAL" | "BUSINESS">("BUSINESS");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ companyName: "", industry: "Software", teamSize: "1-10", primaryGoal: "Scale revenue" });

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated") {
      // skip setup if already completed
    }
  }, [status, router]);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/account/setup", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, accountType }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Setup complete! Personalizing your recommendations…");
        router.push("/dashboard/overview");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center"><Logo markClassName="h-12 w-12" /></div>
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Tell us about you</h1>
          <p className="mt-1 text-sm text-muted-foreground">This helps us personalize your software recommendations.</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => setAccountType("PERSONAL")}
              className={cn("flex flex-col items-center gap-2 rounded-xl border p-5 transition-colors", accountType === "PERSONAL" ? "border-[#22c55e] bg-[#f0fdf4]" : "border-border hover:bg-slate-50")}
            >
              <User className="h-6 w-6 text-[#16a34a]" />
              <span className="font-medium">Personal</span>
              <span className="text-xs text-muted-foreground">Just for me</span>
            </button>
            <button
              onClick={() => setAccountType("BUSINESS")}
              className={cn("flex flex-col items-center gap-2 rounded-xl border p-5 transition-colors", accountType === "BUSINESS" ? "border-[#22c55e] bg-[#f0fdf4]" : "border-border hover:bg-slate-50")}
            >
              <Building2 className="h-6 w-6 text-[#16a34a]" />
              <span className="font-medium">Business</span>
              <span className="text-xs text-muted-foreground">For my team</span>
            </button>
          </div>

          {accountType === "BUSINESS" && (
            <div className="mt-6 space-y-4">
              <div><Label className="mb-1 block">Company name</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="e.g. Northwind Software" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="mb-1 block">Industry</Label><Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
                <div><Label className="mb-1 block">Team size</Label><Input value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} /></div>
              </div>
              <div><Label className="mb-1 block">Primary goal</Label><Input value={form.primaryGoal} onChange={(e) => setForm({ ...form, primaryGoal: e.target.value })} /></div>
            </div>
          )}

          <Button onClick={submit} disabled={loading || !form.companyName && accountType === "BUSINESS"} className="mt-6 w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Finish setup <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}
