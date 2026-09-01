"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { GitBranch, Loader2, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function LoginForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard/overview";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Record<string, string>>({});

  useEffect(() => {
    if (session?.user) router.replace("/dashboard/overview");
    fetch("/api/auth/providers").then((r) => r.json()).then((p) => {
      const map: Record<string, string> = {};
      for (const k of Object.keys(p)) map[k] = p[k].name;
      setProviders(map);
    }).catch(() => {});
  }, [session, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
    if (res?.error) {
      toast.error("Invalid email or password");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo markClassName="h-12 w-12" /></div>
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your PEAKLOOP account.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><Label className="mb-1 block">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="mb-1 block">Password</Label>
                <Link href="/register" className="text-xs text-[#047857] hover:underline">Forgot password?</Link>
              </div>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}</Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or <span className="h-px flex-1 bg-border" /></div>

          <div className="grid gap-2">
            {providers["google"] && (
              <Button variant="outline" onClick={() => signIn("google", { callbackUrl })}>Continue with Google</Button>
            )}
            {providers["github"] && (
              <Button variant="outline" onClick={() => signIn("github", { callbackUrl })}><GitBranch className="h-4 w-4" /> Continue with GitHub</Button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to PEAKLOOP? <Link href="/register" className="font-medium text-[#047857] hover:underline">Create an account</Link>
          </p>
        </div>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" /> Demo account: demo@peakloop.app / password123
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
