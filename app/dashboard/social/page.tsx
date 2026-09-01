"use client";

import { useEffect, useState } from "react";
import { Share2, Loader2, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const platformIcon: Record<string, string> = { Instagram: "📸", Facebook: "📘", WhatsApp: "💬", X: "𝕏", TikTok: "🎵" };
const channelColors: Record<string, string> = { Instagram: "#e1306c", Facebook: "#1877f2", WhatsApp: "#25d366", X: "#1d9bf0", TikTok: "#000000" };

export default function SocialPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [aiState, setAiState] = useState<{ text: string; done?: boolean } | null>(null);
  const [orderCreated, setOrderCreated] = useState(false);

  async function load() { const res = await fetch("/api/social"); const d = await res.json(); setAccounts(d.accounts || []); setOrders(d.orders || []); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function toggle(account: any) {
    await fetch("/api/social/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: account.id, connected: !account.connected }) });
    toast.success(account.connected ? "Disconnected" : "Connected");
    load();
  }

  async function sendMessage() {
    if (!msg.trim()) return;
    const text = msg.toLowerCase();
    const isOrderRequest = /buy|want|order|shirt|qty|\d+\s*blue/i.test(text);
    // simulate AI conversation
    let aiReply = "";
    if (/want 2 blue shirts/i.test(msg) || /2 blue/i.test(msg)) {
      aiReply = "Sure! 2 blue shirts are $40. Would you like to place the order?";
      setAiState({ text: aiReply });
    } else if (isOrderRequest) {
      aiReply = "Great! Could you confirm the quantity and color?";
      setAiState({ text: aiReply });
    } else {
      aiReply = "Hi! Thanks for reaching out. How can I help you today?";
      setAiState({ text: aiReply });
    }
    setMsg(aiReply === "" ? "" : "");
    if (isOrderRequest) setTimeout(() => setAiState((s) => ({ text: s?.text || aiReply, done: true })), 600);
  }

  async function confirmOrder() {
    const total = 4000;
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer: "Instagram Customer", total, channel: "Instagram", paymentStatus: "PAID", items: [{ name: "Blue Shirt", qty: 2, price: 2000 }] }) });
    if (res.ok) { setOrderCreated(true); toast.success("Order created · Inventory updated · Confirmation sent"); load(); }
  }

  return (
    <div>
      <PageHeader eyebrow="PEAK Social" title="Social Commerce" description="Manage social conversations, orders and analytics." />
      {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /> : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Connected accounts</h2>
            {accounts.map((a) => (
              <Card key={a.id} className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg text-white" style={{ background: channelColors[a.platform] || "#22c55e" }}>{platformIcon[a.platform]}</span>
                <div className="flex-1">
                  <div className="font-medium">{a.platform}</div>
                  <div className="text-xs text-muted-foreground">{a.handle} · {a.followers.toLocaleString()} followers</div>
                </div>
                <button onClick={() => toggle(a)} className={`rounded-full px-3 py-1 text-xs font-medium ${a.connected ? "bg-[#ecfdf5] text-[#047857]" : "border border-border text-slate-500"}`}>{a.connected ? "Connected" : "Connect"}</button>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-3 text-sm font-semibold">Unified inbox · Instagram</h2>
            <Card className="flex h-[420px] flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 p-4">
                <div className="mr-6 rounded-2xl bg-slate-100 p-3 text-sm">I want 2 blue shirts.</div>
                {aiState && <div className="ml-6 rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#38bdf8] p-3 text-sm text-white">{aiState.text}</div>}
                {aiState?.done && <div className="flex items-center gap-2 rounded-lg bg-[#ecfdf5] p-2.5 text-xs text-[#047857]"><CheckCircle2 className="h-4 w-4" /> Order created · Inventory updated · Confirmation sent</div>}
              </div>
              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2">
                  <Input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Reply to customer…" onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
                  <Button size="icon" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button variant="soft" size="sm" onClick={() => setAiState({ text: "Sure! 2 blue shirts are $40. Would you like to place the order?", done: false })}><Sparkles className="h-3.5 w-3.5" /> Suggest reply</Button>
                  {aiState?.done === false && <Button size="sm" onClick={confirmOrder}>Place order</Button>}
                  {orderCreated && <Badge variant="success">Order created</Badge>}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
