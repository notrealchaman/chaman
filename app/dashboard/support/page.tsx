"use client";

import { useEffect, useState } from "react";
import { Headphones, Plus, Send, Sparkles, Loader2, ChevronRight } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import type { SupportTicket, SupportMessage } from "@/lib/types";

const statusColor: Record<string, string> = { OPEN: "destructive", IN_PROGRESS: "amber", WAITING: "sky", RESOLVED: "success", CLOSED: "mute" };

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState({ subject: "", message: "", priority: "NORMAL" });

  async function load() {
    const res = await fetch("/api/support");
    const data = await res.json();
    setTickets(data.tickets || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function openTicket(id: string) {
    setActive(id);
    const res = await fetch(`/api/support?id=${id}`);
    const data = await res.json();
    setMessages(data.messages || []);
  }

  async function createTicket() {
    if (!form.subject || !form.message) return toast.error("Add a subject and message");
    const res = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form }) });
    const data = await res.json();
    if (data.ok) { toast.success("Ticket created"); setOpen(false); setForm({ subject: "", message: "", priority: "NORMAL" }); load(); }
  }

  async function send() {
    if (!reply.trim() || !active) return;
    await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "message", ticketId: active, body: reply }) });
    await openTicket(active);
    setReply("");
  }

  async function aiReply() {
    if (!active) return;
    const aiPending = messages.filter((m) => m.fromAi).length;
    if (aiPending > 0) return toast.info("An AI reply is already in this thread");
    await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "ai", ticketId: active, body: form.message || reply }) });
    toast.success("Drafted a reply with PEAK AI");
    await openTicket(active);
  }

  const activeTicket = tickets.find((t) => t.id === active);

  return (
    <div>
      <PageHeader eyebrow="PEAK Desk" title="Support Inbox" description="Tickets, AI replies and customer conversations." actions={<Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New ticket</Button>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {loading && <Loader2 className="col-span-2 mx-auto h-6 w-6 animate-spin text-muted-foreground" />}
            {!loading && tickets.length === 0 && <div className="col-span-2"><EmptyState icon={<Headphones className="h-6 w-6" />} title="No tickets" description="Your support inbox is clear." /></div>}
            {tickets.map((t) => (
              <Card key={t.id} className="p-4 cursor-pointer hover:border-[#bbf7d0]" onClick={() => openTicket(t.id)}>
                <div className="flex items-center justify-between">
                  <Badge variant={(statusColor[t.status] || "secondary") as any}>{t.status}</Badge>
                  <span className="text-xs text-muted-foreground">{timeAgo(t.createdAt)}</span>
                </div>
                <div className="mt-2 font-medium">{t.subject}</div>
                <div className="text-xs text-muted-foreground">{t.priority} · {t.assignee || "Unassigned"}</div>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="flex h-full flex-col overflow-hidden">
            <div className="border-b border-border p-4">
              <div className="font-semibold">{activeTicket?.subject || "Select a ticket"}</div>
              <div className="text-xs text-muted-foreground">Conversation</div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ minHeight: "220px" }}>
              {!active && <div className="text-center text-sm text-muted-foreground">Choose a ticket from the left to view messages.</div>}
              {messages.map((m) => (
                <div key={m.id} className={m.author === "PEAK AI" ? "ml-6 bg-violet-50 p-2.5 text-sm text-violet-800 rounded-lg" : "mr-6 bg-slate-100 p-2.5 text-sm rounded-lg"}>
                  <div className="text-[10px] font-semibold text-muted-foreground">{m.author}</div>
                  <div className="mt-0.5">{m.body}</div>
                </div>
              ))}
            </div>
            {active && (
              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2">
                  <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" onKeyDown={(e) => e.key === "Enter" && send()} />
                  <Button size="icon" onClick={send} aria-label="Send"><Send className="h-4 w-4" /></Button>
                </div>
                <Button variant="soft" size="sm" className="mt-2 w-full" onClick={aiReply}><Sparkles className="h-3.5 w-3.5" /> Draft with AI</Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New support ticket</DialogTitle><DialogDescription>Tell us what's going on.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1 block">Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            <div><Label className="mb-1 block">Message</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            <div><Label className="mb-1 block">Priority</Label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm">
                {["LOW", "NORMAL", "HIGH", "URGENT"].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <Button onClick={createTicket} className="w-full">Create ticket</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
