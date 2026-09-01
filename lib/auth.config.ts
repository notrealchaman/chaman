import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config used by middleware. No DB access — the middleware
 * only needs to decode the JWT session cookie to decide routing.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isProtected =
        path.startsWith("/dashboard") || path.startsWith("/admin");
      const isAuthRoute = path.startsWith("/login") || path.startsWith("/register");
      if (isProtected && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", path);
        return Response.redirect(loginUrl);
      }
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard/overview", nextUrl));
      }
      return true;
    },
  },
};
