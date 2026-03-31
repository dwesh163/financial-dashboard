"use client";

import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { YearSelector } from "@/components/year-selector";
import { toSlug } from "@/lib/utils";
import type { SheetTab } from "@/lib/google/sheets";

const SPECIAL_SHEETS = ["Summary", "Contacts"];

type Props = {
  sheets: SheetTab[];
  userName: string;
  years: number[];
  selectedYear: number;
};

export function Sidebar({ sheets, userName, years, selectedYear }: Props) {
  const pathname = usePathname();
  const [eventsOpen, setEventsOpen] = useState(pathname.startsWith("/events") || pathname === "/");

  const eventSheets = sheets.filter((s) => !SPECIAL_SHEETS.includes(s.title));

  const isActive = (href: string) => pathname === href;
  const isEventActive = (slug: string) => pathname === `/events/${slug}`;

  return (
    <aside className="w-48 shrink-0 flex flex-col border-r border-border bg-sidebar h-screen fixed top-0 left-0 overflow-y-auto z-40">
      {/* Brand — JCM · Finances sur une ligne */}
      <div className="px-5 pt-6 pb-5 border-b border-border flex items-baseline gap-2.5">
        <p className="font-mono text-xl font-bold text-foreground tracking-tighter leading-none">JCM</p>
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Finances</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {/* ── Général ── */}
        <p className="px-5 pb-1.5 text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">
          Général
        </p>

        <Link
          href="/"
          className={`flex items-center gap-2.5 pl-5 pr-4 py-2 text-sm border-l-2 transition-all ${
            isActive("/")
              ? "border-primary text-foreground bg-primary/10 font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0" />
          Comptes
        </Link>

        <button
          type="button"
          onClick={() => setEventsOpen((o) => !o)}
          className={`w-full flex items-center gap-2.5 pl-5 pr-4 py-2 text-sm border-l-2 transition-all cursor-pointer ${
            pathname.startsWith("/events")
              ? "border-primary text-foreground bg-primary/10 font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="flex-1 text-left">Événements</span>
          {eventsOpen ? (
            <ChevronDown className="w-3 h-3 opacity-40" />
          ) : (
            <ChevronRight className="w-3 h-3 opacity-40" />
          )}
        </button>

        {eventsOpen && eventSheets.length > 0 && (
          <div className="flex flex-col py-0.5 mb-1">
            {eventSheets.map((sheet) => {
              const slug = toSlug(sheet.title);
              const active = isEventActive(slug);
              return (
                <Link
                  key={sheet.sheetId}
                  href={`/events/${slug}`}
                  className={`flex items-center gap-2.5 pl-9 pr-4 py-1.5 text-xs transition-colors ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`w-3 h-px flex-shrink-0 ${active ? "bg-primary" : "bg-muted-foreground/25"}`} />
                  <span className="truncate">{sheet.title}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Contacts ── */}
        <div className="mt-3">
          <p className="px-5 pb-1.5 text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">
            Contacts
          </p>

          <Link
            href="/contacts?type=commerce"
            className={`flex items-center gap-2.5 pl-5 pr-4 py-2 text-sm border-l-2 transition-all ${
              pathname === "/contacts"
                ? "border-primary text-foreground bg-primary/10 font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            Commerces
          </Link>

          <Link
            href="/contacts?type=personne"
            className="flex items-center gap-2.5 pl-5 pr-4 py-2 text-sm border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all"
          >
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            Personnes
          </Link>
        </div>
      </nav>

      {/* Year selector — juste au-dessus du footer */}
      {years.length > 0 && (
        <div className="px-4 py-3 border-t border-border">
          <YearSelector years={years} selectedYear={selectedYear} />
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-border px-5 py-3.5 flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-muted-foreground truncate">{userName}</p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex-shrink-0 p-1 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors cursor-pointer"
          title="Se déconnecter"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
