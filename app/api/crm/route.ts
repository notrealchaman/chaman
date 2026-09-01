import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCRMDeals, getCRMLeads, getCRMTasks, getCRMContacts, getCRMCompanies } from "@/lib/data";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    deals: getCRMDeals(session.user.id),
    leads: getCRMLeads(session.user.id),
    tasks: getCRMTasks(session.user.id),
    contacts: getCRMContacts(session.user.id),
    companies: getCRMCompanies(session.user.id),
  });
}
