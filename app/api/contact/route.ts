import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, email, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }
  // In production this would send via Resend. For the demo, we log & ack.
  console.log("Contact message:", { name, email, message });
  return NextResponse.json({ ok: true, message: "Thanks! We'll get back to you within one business day." });
}
