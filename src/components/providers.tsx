"use client";

import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ProvidersProps } from "@/types/props";

export const Providers = ({ children }: ProvidersProps) => (
  <SessionProvider>
    <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
  </SessionProvider>
);
