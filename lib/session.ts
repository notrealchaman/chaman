import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Server-component helper that returns the current user (guaranteed non-null)
 * or redirects to the login route. Use only in Server Components / Route
 * Handlers that need a logged-in identity.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/overview");
  return {
    id: session.user.id as string,
    name: session.user.name,
    email: session.user.email,
    role: (session.user as { role?: string }).role || "USER",
    accountType: (session.user as { accountType?: string }).accountType || "PERSONAL",
    image: session.user.image,
  };
}
