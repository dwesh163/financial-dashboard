"use client";

import { SessionProvider } from "next-auth/react";
import type { ProvidersProps } from "@/types/props";

export const Providers = ({ children }: ProvidersProps) => <SessionProvider>{children}</SessionProvider>;
