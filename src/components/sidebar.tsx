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
    <aside className="w-52 flex-shrink-0 flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 mb-1">
        <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-sm font-semibold text-foreground tracking-tight">JCM · Finances</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5">
        {/* Section: Général */}
        <p className="px-3 pt-1 pb-1.5 text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60">
          Général
        </p>

        <Link
          href="/"
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-all ${
            isActive("/")
              ? "bg-primary text-primary-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0" />
          Comptes
        </Link>

        {/* Événements */}
        <div>
          <button
            type="button"
            onClick={() => setEventsOpen((o) => !o)}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-all cursor-pointer ${
              pathname.startsWith("/events")
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="flex-1 text-left">Événements</span>
            {eventsOpen ? (
              <ChevronDown className="w-3 h-3 opacity-50" />
            ) : (
              <ChevronRight className="w-3 h-3 opacity-50" />
            )}
          </button>

          {eventsOpen && (
            <div className="ml-3 mt-0.5 mb-0.5 flex flex-col gap-0.5 border-l border-border pl-3">
              {eventSheets.map((sheet) => {
                const slug = toSlug(sheet.title);
                const active = isEventActive(slug);
                return (
                  <Link
                    key={sheet.sheetId}
                    href={`/events/${slug}`}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${
                      active
                        ? "bg-primary text-primary-foreground font-medium shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{sheet.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Contacts */}
        <p className="px-3 pt-3 pb-1.5 text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60">
          Contacts
        </p>

        <Link
          href="/contacts?type=commerce"
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-all ${
            pathname === "/contacts"
              ? "bg-primary text-primary-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
          Commerces
        </Link>

        <Link
          href="/contacts?type=personne"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          <Users className="w-3.5 h-3.5 flex-shrink-0" />
          Personnes
        </Link>
      </nav>

      {/* User footer */}
      <div className="border-t border-border mx-2 mt-2 px-3 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{userName}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex-shrink-0 p-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Se déconnecter"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
