import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrders, getCustomers, getSocialAccounts, getProducts } from "@/lib/data";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const u = session.user.id;
  const type = req.nextUrl.searchParams.get("type");
  if (type === "orders") return NextResponse.json({ orders: getOrders(u) });
  if (type === "customers") return NextResponse.json({ customers: getCustomers(u) });
  if (type === "products") return NextResponse.json({ products: getProducts(u) });
  return NextResponse.json({ accounts: getSocialAccounts(u), orders: getOrders(u), customers: getCustomers(u), products: getProducts(u) });
}
