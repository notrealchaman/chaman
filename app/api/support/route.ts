import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { get, run, insert } from "@/lib/db";
import { getTickets, getTicketMessages } from "@/lib/data";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    return NextResponse.json({ ticket: getTickets(session.user.id).find((t) => t.id === id) || null, messages: getTicketMessages(id) });
  }
  return NextResponse.json({ tickets: getTickets(session.user.id) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const id = crypto.randomUUID();
  if (b.action === "message") {
    insert("SupportMessage", { ticketId: b.ticketId, author: session.user.name || "You", body: b.body, fromAi: 0, createdAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, fromAi: false });
  }
  if (b.action === "ai") {
    insert("SupportMessage", { ticketId: b.ticketId, author: "PEAK AI", body: suggestReply(b.body || ""), fromAi: 1, createdAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, fromAi: true });
  }
  // create ticket
  insert("SupportTicket", { userId: session.user.id, subject: b.subject, status: "OPEN", priority: b.priority || "NORMAL", tags: JSON.stringify(b.tags || []), assignee: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, id);
  insert("SupportMessage", { ticketId: id, author: session.user.name || "You", body: b.message || "", fromAi: 0, createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true, id });
}

function suggestReply(text: string) {
  const lower = text.toLowerCase();
  if (/password|login|reset/.test(lower)) return "Hi! I can help with account security. Please reset your password from Settings → Security, and verify your email. Let me know if the issue persists.";
  if (/payment|billing|charge|card/.test(lower)) return "Thanks for reaching out. Could you confirm which invoice or payment you're referring to? I'll check your billing account right away.";
  if (/export|download|csv/.test(lower)) return "You can export data from the relevant section's menu. For CRM contacts, go to CRM → Contacts → Export. Would you like step-by-step instructions?";
  return "Thanks for your message. I've triaged your ticket and assigned it to the right team. I'll draft a resolution and get back to you shortly.";
}
