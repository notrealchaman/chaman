"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MailCheck, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [verifyUrl, setVerifyUrl] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.ok) {
        setVerifyUrl(`/api/auth/verify?token=${data.token}`);
        setStep("verify");
      } else {
        toast.error(data.error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndContinue() {
    setLoading(true);
    try {
      await fetch(verifyUrl);
      const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false, callbackUrl: "/register/setup" });
      if (res?.error) toast.error("Verification done, please sign in");
      else router.push("/register/setup");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo markClassName="h-12 w-12" /></div>
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {step === "form" ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Start free. No credit card required.</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div><Label className="mb-1 block">Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div><Label className="mb-1 block">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <div><Label className="mb-1 block">Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} placeholder="8+ characters" /></div>
                <Button type="submit" disabled={loading} className="w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}</Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-medium text-[#047857] hover:underline">Sign in</Link></p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ecfdf5] text-[#16a34a]"><MailCheck className="h-7 w-7" /></div>
              <h1 className="text-center text-2xl font-bold">Verify your email</h1>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                We sent a verification link to <span className="font-medium text-foreground">{form.email}</span>.
                In this demo, click below to simulate opening the link.
              </p>
              <Button onClick={verifyAndContinue} disabled={loading} className="mt-6 w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Open verification link <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">By continuing you agree to our Terms & Privacy Policy.</p>
      </div>
    </div>
  );
}
