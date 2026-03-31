import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatChf } from "@/lib/chf";
import { getSheetValues, sheetRange } from "@/lib/google/sheets";
import { getSession } from "@/services/auth";
import { getSpreadsheetId } from "@/services/sheets";
import { parseSummary, type SummaryEvent } from "@/services/summary";
import { getSelectedYear } from "@/services/year";

function Diff({ value }: { value: number }) {
  if (value === 0) return <span className="font-mono text-muted-foreground/40">—</span>;
  if (value > 0)
    return (
      <span className="font-mono font-bold tabular-nums text-primary">
        +{formatChf(value)}
      </span>
    );
  return (
    <span className="font-mono font-bold tabular-nums text-destructive">
      {formatChf(value)}
    </span>
  );
}

export default async function SummaryPage() {
  const session = await getSession();
  const selectedYear = await getSelectedYear();
  const spreadsheetId = await getSpreadsheetId(session.accessToken!, selectedYear);
  const rows = await getSheetValues(session.accessToken!, spreadsheetId, sheetRange("Summary"));
  const { events, indicators, totals } = parseSummary(rows);

  /* ── MOBILE ──────────────────────────────────────────────── */
  return (
    <>
      <div className="md:hidden space-y-6">
        {/* Balance hero */}
        <div className="space-y-2 pt-1 border-b border-border pb-5">
          <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">État du compte</p>
          <p className="font-mono text-4xl font-bold tabular-nums text-foreground leading-none">
            {formatChf(indicators.etatReel)}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            Vérif.&nbsp;{indicators.lastCheck || "—"}
          </p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-px bg-border border border-border">
          {[
            { label: "Résultat", value: indicators.resultatReel, colored: true },
            { label: "Initial", value: indicators.soldeInitial, colored: false },
            { label: "Écart", value: indicators.ecart, colored: true },
          ].map(({ label, value, colored }) => (
            <div key={label} className="bg-card px-3 py-4">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</p>
              <p
                className={`font-mono text-sm font-bold tabular-nums leading-none ${
                  colored && value > 0
                    ? "text-primary"
                    : colored && value < 0
                      ? "text-destructive"
                      : "text-foreground"
                }`}
              >
                {formatChf(value)}
              </p>
            </div>
          ))}
        </div>

        {/* Events list */}
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Événements</p>
          <div className="border border-border">
            {events.map((event: SummaryEvent) => {
              const hasData = event.realIn !== 0 || event.realOut !== 0;
              return (
                <Link
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  className={`flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0 transition-colors ${
                    hasData ? "hover:bg-white/[0.04] active:bg-white/[0.04]" : "opacity-25 pointer-events-none"
                  }`}
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

      {/* ── DESKTOP ──────────────────────────────────────────── */}
      <div className="hidden md:block space-y-6">
        {/* Header — year as hero */}
        <div className="flex items-end justify-between pb-5 border-b border-border">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Aperçu annuel</p>
            <p className="font-mono text-6xl font-bold text-foreground leading-none tabular-nums">
              {selectedYear}
            </p>
          </div>
          <div className="text-right pb-1">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Dernière vérification</p>
            <p className="font-mono text-sm text-muted-foreground">{indicators.lastCheck || "—"}</p>
          </div>
        </div>

        {/* KPI bar */}
        <div className="grid grid-cols-4 gap-px bg-border border border-border">
          {[
            { label: "Solde initial", value: indicators.soldeInitial, colored: false },
            { label: "Résultat réel", value: indicators.resultatReel, colored: true },
            { label: "État réel", value: indicators.etatReel, colored: false },
            {
              label: "Écart",
              value: indicators.ecart,
              colored: true,
              sub: `Théo. ${formatChf(indicators.etatTheorique)}`,
            },
          ].map(({ label, value, colored, sub }) => (
            <div key={label} className="bg-card px-5 py-5">
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{label}</p>
              <p
                className={`font-mono text-2xl font-bold tabular-nums leading-none ${
                  colored && value > 0
                    ? "text-primary"
                    : colored && value < 0
                      ? "text-destructive"
                      : "text-foreground"
                }`}
              >
                {formatChf(value)}
              </p>
              {sub && <p className="font-mono text-xs text-muted-foreground mt-2">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Events ledger */}
        <div className="border border-border">
          {/* Table header */}
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
                className={`text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground ${right ? "text-right" : ""}`}
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
                className={`grid grid-cols-[1fr_120px_120px_120px_120px_110px] gap-2 items-center px-5 py-3.5 border-b border-border last:border-0 transition-colors group ${
                  hasData
                    ? "hover:bg-white/[0.04]"
                    : "opacity-25 cursor-default pointer-events-none"
                }`}
              >
                <p className="text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {event.title}
                  {event.subtitle && (
                    <span className="ml-2 font-mono text-muted-foreground font-normal text-xs">
                      {event.subtitle}
                    </span>
                  )}
                </p>
                <div className="font-mono text-sm text-right text-muted-foreground tabular-nums">
                  {formatChf(event.budgetIn)}
                </div>
                <div className="font-mono text-sm text-right text-muted-foreground tabular-nums">
                  {formatChf(event.budgetOut)}
                </div>
                <div className="font-mono text-sm text-right text-foreground tabular-nums">
                  {formatChf(event.realIn)}
                </div>
                <div className="font-mono text-sm text-right text-foreground tabular-nums">
                  {formatChf(event.realOut)}
                </div>
                <div className="text-sm text-right">
                  <Diff value={event.difference} />
                </div>
              </Link>
            );
          })}

          {/* Total row */}
          <div className="grid grid-cols-[1fr_120px_120px_120px_120px_110px] gap-2 items-center px-5 py-3.5 bg-muted/30 border-t border-border">
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Total</span>
            <span className="font-mono text-sm text-right text-muted-foreground tabular-nums">
              {formatChf(totals.budgetIn)}
            </span>
            <span className="font-mono text-sm text-right text-muted-foreground tabular-nums">
              {formatChf(totals.budgetOut)}
            </span>
            <span className="font-mono text-sm font-bold text-right text-foreground tabular-nums">
              {formatChf(totals.realIn)}
            </span>
            <span className="font-mono text-sm font-bold text-right text-foreground tabular-nums">
              {formatChf(totals.realOut)}
            </span>
            <span className="text-sm font-bold text-right">
              <Diff value={totals.difference} />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
