import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUnreadCount } from "@/lib/data";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/overview");
  const unread = session.user.id ? getUnreadCount(session.user.id) : 0;

  return (
    <DashboardShell
      user={{ name: session.user.name, email: session.user.email, role: session.user.role, image: session.user.image }}
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
