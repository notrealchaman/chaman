import { NextRequest, NextResponse } from "next/server";
import { get, run, remove } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
  const row = get<{ identifier: string; expires: string }>(`SELECT identifier, expires FROM "VerificationToken" WHERE token = ?`, [token]);
  if (!row) return new NextResponse("Invalid or expired token", { status: 400, headers: { "content-type": "text/plain" } });
  if (new Date(row.expires) < new Date()) return new NextResponse("Token expired", { status: 400, headers: { "content-type": "text/plain" } });

  run(`UPDATE "User" SET emailVerified = ? WHERE email = ?`, [new Date().toISOString(), row.identifier]);
  remove("VerificationToken", token);
  return new NextResponse("Email verified. You can now sign in.", { status: 200, headers: { "content-type": "text/plain" } });
}
