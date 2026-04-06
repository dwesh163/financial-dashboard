"use client";

import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  UserRound,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Fragment, useState } from "react";
import { YearSelector } from "@/components/navigation/year-selector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SPECIAL_SHEETS } from "@/constants/spreadsheet";
import { cn, toSlug } from "@/lib/utils";
import { createEvent } from "@/services/spreadsheet";
import type { SidebarProps } from "@/types/props";

export const Sidebar = ({ sheets, userName, userImage, years, selectedYear }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [eventsOpen, setEventsOpen] = useState(pathname.startsWith("/events") || pathname === "/");
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSheets = sheets.filter((s) => !SPECIAL_SHEETS.includes(s.title));
  const isActive = (href: string) => pathname === href;
  const isEventActive = (slug: string) => pathname === `/events/${slug}`;

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createEvent(newEventName.trim());
      setNewEventOpen(false);
      setNewEventName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <aside className="w-56 shrink-0 flex flex-col border-r border-border bg-sidebar h-screen fixed top-0 left-0 overflow-y-auto z-40">
        <div className="px-5 pt-6 pb-5 border-b border-border flex items-baseline gap-2.5">
          <p className="font-mono text-xl font-bold text-foreground tracking-tighter leading-none">JCM</p>
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Finances</p>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-0.5 overflow-y-auto">
          <p className="px-5 pb-1.5 text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">Général</p>

          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 pl-5 pr-4 py-2 text-sm border-l-2 transition-all",
              isActive("/")
                ? "border-primary text-foreground bg-primary/10 font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
            Aperçu
          </Link>

          <div className="flex items-center pr-3">
            <button
              type="button"
              onClick={() => setEventsOpen((o) => !o)}
              className={cn(
                "flex-1 flex items-center gap-2.5 pl-5 pr-2 py-2 text-sm border-l-2 transition-all cursor-pointer",
                pathname.startsWith("/events")
                  ? "border-primary text-foreground bg-primary/10 font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 text-left">Événements</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);
                  setNewEventName("");
                  setNewEventOpen(true);
                }}
                className="p-1 text-muted-foreground opacity-80 -mr-2 hover:text-foreground transition-colors shrink-0"
                title="Nouvel événement"
              >
                <Plus className="w-3 h-3" />
              </button>
              {eventsOpen ? (
                <ChevronDown className="w-3 h-3 opacity-40" />
              ) : (
                <ChevronRight className="w-3 h-3 opacity-40" />
              )}
            </button>
          </div>

          {eventsOpen && eventSheets.length > 0 && (
            <div className="flex flex-col py-0.5 mb-1">
              {eventSheets.map((sheet) => {
                const slug = toSlug(sheet.title);
                const active = isEventActive(slug);
                return (
                  <Link
                    key={sheet.sheetId}
                    href={`/events/${slug}`}
                    className={cn(
                      "flex items-center gap-2.5 pl-9 pr-4 py-1.5 text-xs transition-colors",
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className={cn("w-3 h-px shrink-0", active ? "bg-primary" : "bg-muted-foreground/25")} />
                    <span className="truncate">{sheet.title}</span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-3">
            <p className="px-5 pb-1.5 text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">Contacts</p>

            <Link
              href="/contacts"
              className={cn(
                "flex items-center gap-2.5 pl-5 pr-4 py-2 text-sm border-l-2 transition-all",
                pathname === "/contacts"
                  ? "border-primary text-foreground bg-primary/10 font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              Contacts
            </Link>
          </div>
        </nav>

        <div className="px-4 py-3 border-t border-border">
          <YearSelector years={years} selectedYear={selectedYear} />
        </div>

        <div className="border-t border-border px-5 py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {userImage ? (
              <Image src={userImage} alt="Avatar" width={24} height={24} className="rounded-full" />
            ) : (
              <UserRound className="w-8 h-8 rounded-full bg-muted text-muted-foreground p-1" />
            )}
            <p className="font-mono text-[11px] text-muted-foreground truncate">{userName}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="shrink-0 p-1 text-muted-foreground hover:text-foreground hover:bg-white/6 transition-colors cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      <Dialog open={newEventOpen} onOpenChange={setNewEventOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Nouvel événement
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <FormField label="Nom">
              <Input
                placeholder="Nom de l'événement..."
                value={newEventName}
                onChange={(e) => {
                  setNewEventName(e.target.value);
                  setError(null);
                }}
                autoFocus
                required
              />
            </FormField>
            {error && <FormError message={error} />}
            <div className="flex justify-end gap-2 pt-1 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setNewEventOpen(false)} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !newEventName.trim()} className="min-w-24">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};
