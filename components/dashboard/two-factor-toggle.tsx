"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function TwoFactorToggle({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  async function onChange(v: boolean) {
    setEnabled(v);
    await fetch("/api/security/2fa", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: v }) });
    toast.success(v ? "Two-factor enabled" : "Two-factor disabled");
  }
  return <Switch checked={enabled} onCheckedChange={onChange} />;
}
