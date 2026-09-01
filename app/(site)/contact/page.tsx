"use client";

import { useState } from "react";
import { Loader2, Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Section, SectionHeading } from "@/components/site/section";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.ok) {
        toast.success(data.message);
        setForm({ name: "", email: "", message: "" });
      } else toast.error(data.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section>
      <SectionHeading eyebrow="Contact" title="We'd love to hear from you" description="Questions, feedback or partnership inquiries — get in touch." />
      <div className="mx-auto mt-10 grid max-w-4xl gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Mail, title: "Email us", desc: "hello@peakloop.app" },
            { icon: MessageSquare, title: "Chat with us", desc: "Live chat, Mon–Fri 9am–6pm" },
            { icon: Send, title: "Partnerships", desc: "partners@peakloop.app" },
          ].map((c) => (
            <div key={c.title} className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#16a34a]"><c.icon className="h-5 w-5" /></span>
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-muted-foreground">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div><Label className="mb-1 block">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label className="mb-1 block">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div><Label className="mb-1 block">Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} /></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}</Button>
          </div>
        </form>
      </div>
    </Section>
  );
}
