import { ArrowDownRight, ArrowUpRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/services/auth";
import { formatChf, getSheetValues, parseSummary, SPREADSHEET_ID, type SummaryEvent } from "@/services/sheets";

function Diff({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted-foreground/40">—</span>;
  if (value > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-primary font-semibold tabular-nums">
        <ArrowUpRight className="w-3.5 h-3.5" />
        {formatChf(value)}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-destructive font-semibold tabular-nums">
      <ArrowDownRight className="w-3.5 h-3.5" />
      {formatChf(value)}
    </span>
  );
}

export default async function SummaryPage() {
  const session = await getSession();
  const rows = await getSheetValues(session.accessToken!, SPREADSHEET_ID, "Summary");
  const { events, indicators, totals } = parseSummary(rows);

  /* ── MOBILE ──────────────────────────────────────────────── */
  return (
    <>
      <div className="md:hidden space-y-6">
        {/* Balance hero */}
        <div className="space-y-1 pt-1">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">État du compte</p>
          <p className="text-4xl font-bold tabular-nums text-foreground leading-none">
            {formatChf(indicators.etatReel)}
          </p>
          <p className="text-xs text-muted-foreground">Vérif. {indicators.lastCheck || "—"}</p>
        </div>

        {/* KPI cards row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Résultat", value: indicators.resultatReel, colored: true },
            { label: "Initial", value: indicators.soldeInitial, colored: false },
            { label: "Écart", value: indicators.ecart, colored: true },
          ].map(({ label, value, colored }) => (
            <div key={label} className="bg-card rounded-xl border border-border px-3 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
              <p
                className={`text-sm font-bold tabular-nums leading-none ${
                  colored && value > 0 ? "text-primary" : colored && value < 0 ? "text-destructive" : "text-foreground"
                }`}
              >
                {formatChf(value)}
              </p>
            </div>
          ))}
        </div>

        {/* Events list */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Événements</p>
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            {events.map((event: SummaryEvent) => {
              const hasData = event.realIn !== 0 || event.realOut !== 0;
              return (
                <Link
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  className={`flex items-center justify-between px-4 py-4 border-b border-border last:border-0 transition-colors ${
                    hasData ? "active:bg-muted/50" : "opacity-30 pointer-events-none"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                    {event.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{event.subtitle}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <Diff value={event.difference} />
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                  </div>
                </Link>
              );
            })}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
              <span className="text-xs font-semibold text-foreground">Total</span>
              <Diff value={totals.difference} />
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP ──────────────────────────────────────────── */}
      <div className="hidden md:block space-y-4">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Aperçu annuel 2026</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Dernière vérification : {indicators.lastCheck || "—"}</p>
        </div>

        <div className="grid grid-cols-4 gap-px bg-border rounded-lg overflow-hidden border border-border">
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
            <div key={label} className="bg-card px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
              <p
                className={`text-base font-semibold tabular-nums leading-none ${
                  colored && value > 0 ? "text-primary" : colored && value < 0 ? "text-destructive" : "text-foreground"
                }`}
              >
                {formatChf(value)}
              </p>
              {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_110px_110px_110px_110px_90px] gap-2 px-4 py-2 bg-muted/40 border-b border-border">
            {["Événement", "Budget entrées", "Budget sorties", "Réel entrées", "Réel sorties", "Résultat"].map(
              (col, i) => (
                <span
                  key={col}
                  className={`text-[10px] uppercase tracking-widest font-medium text-muted-foreground ${i > 0 ? "text-right" : ""}`}
                >
                  {col}
                </span>
              ),
            )}
          </div>
          {events.map((event: SummaryEvent) => {
            const hasData = event.realIn !== 0 || event.realOut !== 0;
            return (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className={`grid grid-cols-[1fr_110px_110px_110px_110px_90px] gap-2 items-center px-4 py-2 border-b border-border last:border-0 transition-colors group ${
                  hasData ? "hover:bg-muted/30" : "opacity-35 cursor-default pointer-events-none"
                }`}
              >
                <p className="text-xs text-foreground group-hover:text-primary transition-colors truncate">
                  {event.title}
                  {event.subtitle && (
                    <span className="ml-1.5 text-muted-foreground/60 font-normal text-[11px]">{event.subtitle}</span>
                  )}
                </p>
                <div className="text-xs text-right text-muted-foreground tabular-nums">{formatChf(event.budgetIn)}</div>
                <div className="text-xs text-right text-muted-foreground tabular-nums">
                  {formatChf(event.budgetOut)}
                </div>
                <div className="text-xs text-right text-foreground tabular-nums">{formatChf(event.realIn)}</div>
                <div className="text-xs text-right text-foreground tabular-nums">{formatChf(event.realOut)}</div>
                <div className="text-xs text-right">
                  <Diff value={event.difference} />
                </div>
              </Link>
            );
          })}
          <div className="grid grid-cols-[1fr_110px_110px_110px_110px_90px] gap-2 items-center px-4 py-2 bg-muted/40 border-t border-border">
            <span className="text-xs font-semibold text-foreground">Total</span>
            <span className="text-xs text-right text-muted-foreground tabular-nums">{formatChf(totals.budgetIn)}</span>
            <span className="text-xs text-right text-muted-foreground tabular-nums">{formatChf(totals.budgetOut)}</span>
            <span className="text-xs font-semibold text-right text-foreground tabular-nums">
              {formatChf(totals.realIn)}
            </span>
            <span className="text-xs font-semibold text-right text-foreground tabular-nums">
              {formatChf(totals.realOut)}
            </span>
            <span className="text-xs font-semibold text-right">
              <Diff value={totals.difference} />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
