"use client";

import { LogOut, UserRound } from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { YearSelector } from "@/components/navigation/year-selector";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ProfileDialogProps } from "@/types/props";

export const ProfileDialog = ({ userName, userImage, years, selectedYear, version }: ProfileDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-center gap-3 h-20 w-16">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-full transition-opacity hover:opacity-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {userImage ? (
          <Image src={userImage} alt="Avatar" width={40} height={40} className="rounded-full" />
        ) : (
          <UserRound className="w-10 h-10 rounded-full bg-muted text-muted-foreground p-2" />
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xs p-0 overflow-hidden">
          <DialogTitle className="sr-only">Profil</DialogTitle>

          {/* ── Hero ── */}
          <div className="relative flex flex-col items-center gap-3 px-6 pt-10 pb-7">
            <div className="absolute inset-x-0 top-0 h-px" />

            <div
              className={cn(
                "relative w-16 h-16 rounded-full ring-1 ring-white/10 shadow-lg overflow-hidden shrink-0",
                !userImage && "bg-muted flex items-center justify-center",
              )}
            >
              {userImage ? (
                <Image src={userImage} alt="Avatar" width={64} height={64} className="object-cover" />
              ) : (
                <UserRound className="w-8 h-8 text-muted-foreground" />
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="font-mono text-sm font-bold text-foreground tracking-tight leading-none">{userName}</p>
              <span className="inline-block font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 border border-border px-1.5 py-0.5">
                v{version}
              </span>
            </div>
          </div>

          {/* ── Année ── */}
          <div className="px-5 py-4 border-t border-border space-y-2.5">
            <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 font-semibold">
              Année active
            </p>
            <YearSelector years={years} selectedYear={selectedYear} />
          </div>

          {/* ── Déconnexion ── */}
          <div className="border-t border-border">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="group w-full flex items-center gap-2.5 px-5 py-3.5 font-mono text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
              Se déconnecter
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
