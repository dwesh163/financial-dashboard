import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/services/auth";
import { formatChf, getSheetValues, parseSummary, SPREADSHEET_ID, type SummaryEvent } from "@/services/sheets";

function AmountCell({ value, colored = false }: { value: number; colored?: boolean }) {
  if (value === 0) return <span className="text-muted-foreground/40">—</span>;
  if (colored && value > 0) return <span className="text-primary font-medium">{formatChf(value)}</span>;
  if (colored && value < 0) return <span className="text-destructive font-medium">{formatChf(value)}</span>;
  return <span className="text-muted-foreground">{formatChf(value)}</span>;
}

function DiffCell({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted-foreground/40">—</span>;
  if (value > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-primary font-medium">
        <ArrowUpRight className="w-3 h-3" />
        {formatChf(value)}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-destructive font-medium">
      <ArrowDownRight className="w-3 h-3" />
      {formatChf(value)}
    </span>
  );
}

export default async function SummaryPage() {
  const session = await getSession();
  const rows = await getSheetValues(session.accessToken!, SPREADSHEET_ID, "Summary");
  const { events, indicators, totals } = parseSummary(rows);

  return (
    <div className="space-y-4">
      {/* Header + KPIs */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-base font-semibold text-foreground">Aperçu annuel 2026</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Dernière vérification : {indicators.lastCheck || "—"}</p>
        </div>
        <div className="grid grid-cols-4 gap-2 flex-shrink-0">
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
            <div key={label} className="bg-card border border-border rounded-lg px-3 py-2 min-w-[130px]">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
              <p
                className={`text-sm font-semibold tabular-nums ${
                  colored && value > 0 ? "text-primary" : colored && value < 0 ? "text-destructive" : "text-foreground"
                }`}
              >
                {formatChf(value)}
              </p>
              {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Events table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_110px_110px_110px_110px_90px] gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
          <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Événement</span>
          <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-right">
            Budget entrées
          </span>
          <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-right">
            Budget sorties
          </span>
          <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-right">
            Réel entrées
          </span>
          <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-right">
            Réel sorties
          </span>
          <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-right">
            Résultat
          </span>
        </div>

        {events.map((event: SummaryEvent) => {
          const hasData = event.realIn !== 0 || event.realOut !== 0;
          return (
            <Link
              key={event.slug}
              href={`/events/${event.slug}`}
              className={`grid grid-cols-[1fr_110px_110px_110px_110px_90px] gap-2 items-center px-4 py-2 border-b border-border last:border-0 transition-colors group ${
                hasData ? "hover:bg-muted/40" : "opacity-40 cursor-default pointer-events-none"
              }`}
            >
              <p className="text-xs text-foreground group-hover:text-primary transition-colors truncate">
                {event.title}
                {event.subtitle && <span className="ml-1.5 text-muted-foreground font-normal">{event.subtitle}</span>}
              </p>
              <div className="text-xs text-right">
                <AmountCell value={event.budgetIn} />
              </div>
              <div className="text-xs text-right">
                <AmountCell value={event.budgetOut} />
              </div>
              <div className="text-xs text-right">
                <AmountCell value={event.realIn} />
              </div>
              <div className="text-xs text-right">
                <AmountCell value={event.realOut} />
              </div>
              <div className="text-xs text-right">
                <DiffCell value={event.difference} />
              </div>
            </Link>
          );
        })}

        {/* Total row */}
        <div className="grid grid-cols-[1fr_110px_110px_110px_110px_90px] gap-2 items-center px-4 py-2.5 bg-muted/50 border-t border-border">
          <span className="text-xs font-semibold text-foreground">Total</span>
          <span className="text-xs text-right text-muted-foreground">{formatChf(totals.budgetIn)}</span>
          <span className="text-xs text-right text-muted-foreground">{formatChf(totals.budgetOut)}</span>
          <span className="text-xs font-semibold text-right text-foreground">{formatChf(totals.realIn)}</span>
          <span className="text-xs font-semibold text-right text-foreground">{formatChf(totals.realOut)}</span>
          <span className="text-xs font-semibold text-right">
            <DiffCell value={totals.difference} />
          </span>
        </div>
      </div>
    </div>
  );
}
