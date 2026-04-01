import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { formatDevise } from "@/lib/devise";
import { getSheetValues, sheetRange } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import { getSelectedYear } from "@/services/auth";
import { getSpreadsheetId } from "@/services/spreadsheet";
import { parseSummary } from "@/services/summary";
import type { SummaryEvent } from "@/types/summary";

const Diff = ({ value }: { value: number }) => {
  if (value === 0) return <span className="font-mono text-muted-foreground/40">—</span>;
  if (value > 0) return <span className="font-mono font-bold tabular-nums text-primary">+{formatDevise(value)}</span>;
  return <span className="font-mono font-bold tabular-nums text-destructive">{formatDevise(value)}</span>;
};

export default async function SummaryPage() {
  const selectedYear = await getSelectedYear();
  const spreadsheetId = await getSpreadsheetId();
  const rows = spreadsheetId ? await getSheetValues({ spreadsheetId, range: sheetRange({ title: "Summary" }) }) : [];
  const { events, indicators, totals } = parseSummary(rows);

  return (
    <Fragment>
      <div className="md:hidden space-y-6">
        <div className="space-y-2 pt-1 border-b border-border pb-5">
          <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">État du compte</p>
          <p className="font-mono text-4xl font-bold tabular-nums text-foreground leading-none">
            {formatDevise(indicators.etatReel)}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">Vérif.&nbsp;{indicators.lastCheck || "—"}</p>
        </div>

        <div className="grid grid-cols-3 gap-px bg-border border border-border">
          {[
            { label: "Résultat", value: indicators.resultatReel, colored: true },
            { label: "Initial", value: indicators.soldeInitial, colored: false },
            { label: "Écart", value: indicators.ecart, colored: true },
          ].map(({ label, value, colored }) => (
            <div key={label} className="bg-card px-3 py-4">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</p>
              <p
                className={cn(
                  "font-mono text-sm font-bold tabular-nums leading-none",
                  colored && value > 0 ? "text-primary" : colored && value < 0 ? "text-destructive" : "text-foreground",
                )}
              >
                {formatDevise(value)}
              </p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Événements</p>
          <div className="border border-border">
            {events.map((event: SummaryEvent) => {
              const hasData = event.realIn !== 0 || event.realOut !== 0;
              return (
                <Link
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0 transition-colors",
                    hasData ? "hover:bg-white/[0.04] active:bg-white/[0.04]" : "opacity-25 pointer-events-none",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{event.title}</p>
                    {event.subtitle && (
                      <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{event.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <Diff value={event.difference} />
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
                  </div>
                </Link>
              );
            })}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t border-border">
              <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Total</span>
              <Diff value={totals.difference} />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block space-y-6">
        <div className="flex items-end justify-between pb-5 border-b border-border">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Aperçu annuel</p>
            <p className="font-mono text-6xl font-bold text-foreground leading-none tabular-nums">{selectedYear}</p>
          </div>
          <div className="text-right pb-1">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Dernière vérification</p>
            <p className="font-mono text-sm text-muted-foreground">{indicators.lastCheck || "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-px bg-border border border-border">
          {[
            { label: "Solde initial", value: indicators.soldeInitial, colored: false },
            { label: "Résultat réel", value: indicators.resultatReel, colored: true },
            { label: "État réel", value: indicators.etatReel, colored: false },
            {
              label: "Écart",
              value: indicators.ecart,
              colored: true,
              sub: `Théo. ${formatDevise(indicators.etatTheorique)}`,
            },
          ].map(({ label, value, colored, sub }) => (
            <div key={label} className="bg-card px-5 py-5">
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{label}</p>
              <p
                className={cn(
                  "font-mono text-2xl font-bold tabular-nums leading-none",
                  colored && value > 0 ? "text-primary" : colored && value < 0 ? "text-destructive" : "text-foreground",
                )}
              >
                {formatDevise(value)}
              </p>
              {sub && <p className="font-mono text-xs text-muted-foreground mt-2">{sub}</p>}
            </div>
          ))}
        </div>

        <div className="border border-border">
          <div className="grid grid-cols-[1fr_120px_120px_120px_120px_110px] gap-2 px-5 py-2.5 bg-muted/30 border-b border-border">
            {[
              { label: "Événement", right: false },
              { label: "Budget ▲", right: true },
              { label: "Budget ▼", right: true },
              { label: "Réel ▲", right: true },
              { label: "Réel ▼", right: true },
              { label: "Δ", right: true },
            ].map(({ label, right }) => (
              <span
                key={label}
                className={cn(
                  "text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground",
                  right && "text-right",
                )}
              >
                {label}
              </span>
            ))}
          </div>

          {events.map((event: SummaryEvent) => {
            const hasData = event.realIn !== 0 || event.realOut !== 0;
            return (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className={cn(
                  "grid grid-cols-[1fr_120px_120px_120px_120px_110px] gap-2 items-center px-5 py-3.5 border-b border-border last:border-0 transition-colors group",
                  hasData ? "hover:bg-white/[0.04]" : "opacity-25 cursor-default pointer-events-none",
                )}
              >
                <p className="text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {event.title}
                  {event.subtitle && (
                    <span className="ml-2 font-mono text-muted-foreground font-normal text-xs">{event.subtitle}</span>
                  )}
                </p>
                <div className="font-mono text-sm text-right text-muted-foreground tabular-nums">
                  {formatDevise(event.budgetIn)}
                </div>
                <div className="font-mono text-sm text-right text-muted-foreground tabular-nums">
                  {formatDevise(event.budgetOut)}
                </div>
                <div className="font-mono text-sm text-right text-foreground tabular-nums">
                  {formatDevise(event.realIn)}
                </div>
                <div className="font-mono text-sm text-right text-foreground tabular-nums">
                  {formatDevise(event.realOut)}
                </div>
                <div className="text-sm text-right">
                  <Diff value={event.difference} />
                </div>
              </Link>
            );
          })}

          <div className="grid grid-cols-[1fr_120px_120px_120px_120px_110px] gap-2 items-center px-5 py-3.5 bg-muted/30 border-t border-border">
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Total</span>
            <span className="font-mono text-sm text-right text-muted-foreground tabular-nums">
              {formatDevise(totals.budgetIn)}
            </span>
            <span className="font-mono text-sm text-right text-muted-foreground tabular-nums">
              {formatDevise(totals.budgetOut)}
            </span>
            <span className="font-mono text-sm font-bold text-right text-foreground tabular-nums">
              {formatDevise(totals.realIn)}
            </span>
            <span className="font-mono text-sm font-bold text-right text-foreground tabular-nums">
              {formatDevise(totals.realOut)}
            </span>
            <span className="text-sm font-bold text-right">
              <Diff value={totals.difference} />
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
