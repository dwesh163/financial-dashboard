"use client";

import { SessionProvider as NextAuthSessionProvider, type SessionProviderProps } from "next-auth/react";

export const SessionProvider = ({ children, session }: SessionProviderProps) => (
  <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
);
