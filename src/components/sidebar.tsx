"use client";

import {
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { type SheetTab, SPECIAL_SHEETS, toSlug } from "@/services/sheets";

type Props = {
  sheets: SheetTab[];
  userName: string;
};

export function Sidebar({ sheets, userName }: Props) {
  const pathname = usePathname();
  const [eventsOpen, setEventsOpen] = useState(pathname.startsWith("/events") || pathname === "/");

  const eventSheets = sheets.filter((s) => !SPECIAL_SHEETS.includes(s.title));

  const isActive = (href: string) => pathname === href;
  const isEventActive = (slug: string) => pathname === `/events/${slug}`;

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-border bg-card h-screen sticky top-0 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-foreground">JCM - Finances</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {/* Comptes */}
        <Link
          href="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            isActive("/")
              ? "bg-primary/15 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          Comptes
        </Link>

        {/* Événements */}
        <div>
          <button
            type="button"
            onClick={() => setEventsOpen((o) => !o)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">Événements</span>
            {eventsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {eventsOpen && (
            <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
              {eventSheets.map((sheet) => {
                const slug = toSlug(sheet.title);
                return (
                  <Link
                    key={sheet.sheetId}
                    href={`/events/${slug}`}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                      isEventActive(slug)
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                    {sheet.title}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="my-1 h-px bg-border" />

        {/* Commerces */}
        <Link
          href="/contacts?type=commerce"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            pathname === "/contacts" && typeof window !== "undefined"
              ? "bg-primary/15 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Building2 className="w-4 h-4 flex-shrink-0" />
          Commerces
        </Link>

        {/* Personnes */}
        <Link
          href="/contacts?type=personne"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          Personnes
        </Link>
      </nav>

      {/* User footer */}
      <div className="border-t border-border px-3 py-3 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground truncate">{userName}</span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex-shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
