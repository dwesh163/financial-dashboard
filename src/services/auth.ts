import { redirect } from "next/navigation";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { AuthTokens } from "@/types/auth";

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, account, trigger, session }) => {
      if (trigger === "update" && typeof session?.selectedYear === "number")
        return { ...token, selectedYear: session.selectedYear };
      if (account)
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          selectedYear: new Date().getFullYear(),
        };
      if (typeof token.expiresAt === "number" && Date.now() < (token.expiresAt - 60) * 1000) return token;
      try {
        if (!token.refreshToken) throw new Error("No refresh token available");
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
          throw new Error("Google client ID or secret not configured");
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: String(token.refreshToken),
          }),
        });
        const tokens = (await response.json()) as { access_token: string; expires_in: number; refresh_token?: string };
        if (!response.ok) throw tokens;
        return {
          ...token,
          accessToken: tokens.access_token,
          expiresAt: Math.floor(Date.now() / 1000 + tokens.expires_in),
          refreshToken: tokens.refresh_token ?? token.refreshToken,
        };
      } catch {
        return { ...token, error: "RefreshTokenError" as const };
      }
    },
    session: async ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: typeof token.sub === "string" ? token.sub : session.user.id,
        },
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        expiresAt: token.expiresAt,
        selectedYear: token.selectedYear,
        error: token.error,
      };
    },
  },
});

export const getSession = async () => {
  const session = await auth();
  if (!session) throw new Error("unauthenticated");
  return session;
};

export const getTokens = async (): Promise<AuthTokens> => {
  const session = await auth();
  if (!session?.accessToken || session.error === "RefreshTokenError") redirect("/login");
  return { accessToken: session.accessToken, refreshToken: session.refreshToken, expiresAt: session.expiresAt };
};

export const getSelectedYear = async (): Promise<number> => {
  const session = await auth();
  return session?.selectedYear ?? new Date().getFullYear();
};
