import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import { get } from "@/lib/db";

const oauthProviders = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  oauthProviders.push(
    Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })
  );
}
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  oauthProviders.push(
    GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET })
  );
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase();
        const user = get<{ id: string; name: string | null; email: string | null; passwordHash: string | null; role: string; accountType: string; image: string | null }>(
          `SELECT id, name, email, passwordHash, role, accountType, image FROM "User" WHERE email = ?`,
          [email]
        );
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          accountType: user.accountType,
        };
      },
    }),
    ...(oauthProviders as any),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).id as string;
        token.role = (user as any).role as string;
        token.accountType = (user as any).accountType as string;
        token.provider = account?.provider ?? "credentials";
      }
      // refresh role/name on each session if missing
      if (token?.id && (!token.role || !token.name)) {
        const u = get<{ name: string | null; role: string; accountType: string }>(
          `SELECT name, role, accountType FROM "User" WHERE id = ?`,
          [token.id as string]
        );
        if (u) {
          token.name = u.name;
          token.role = u.role;
          token.accountType = u.accountType;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).accountType = token.accountType as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
