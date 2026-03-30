import { ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/services/auth";
import {
  formatChf,
  getSheetValues,
  getSpreadsheetMeta,
  parseTransactions,
  SPECIAL_SHEETS,
  SPREADSHEET_ID,
  type Transaction,
  toSlug,
} from "@/services/sheets";

function AmountBadge({ tx }: { tx: Transaction }) {
  if (tx.in !== null && tx.in > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-primary font-semibold tabular-nums">
        <ArrowUpRight className="w-3.5 h-3.5" />+{formatChf(tx.in)}
      </span>
    );
  }
  if (tx.out !== null && tx.out > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-destructive font-semibold tabular-nums">
        <ArrowDownLeft className="w-3.5 h-3.5" />-{formatChf(tx.out)}
      </span>
    );
  }
  return <span className="text-muted-foreground/30">—</span>;
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();

  const meta = await getSpreadsheetMeta(session.accessToken!, SPREADSHEET_ID);
  const sheet = meta.sheets.find((s) => toSlug(s.title) === slug && !SPECIAL_SHEETS.includes(s.title));
  if (!sheet) notFound();

  const rows = await getSheetValues(session.accessToken!, SPREADSHEET_ID, sheet.title);
  const transactions = parseTransactions(rows);

  const totalIn = transactions.reduce((s, t) => s + (t.in ?? 0), 0);
  const totalOut = transactions.reduce((s, t) => s + (t.out ?? 0), 0);
  const delta = totalIn - totalOut;

  const kpis = [
    { label: "Entrées", value: totalIn, color: "positive" as const },
    { label: "Sorties", value: totalOut, color: "negative" as const },
    { label: "Résultat", value: delta, color: "auto" as const },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground transition-colors hidden md:inline">
              Comptes
            </Link>
            <span className="hidden md:inline">/</span>
            <Link href="/events" className="hover:text-foreground transition-colors">
              Événements
            </Link>
            <span>/</span>
            <span className="truncate max-w-[120px] md:max-w-none">{sheet.title}</span>
          </div>
          <h1 className="text-lg md:text-sm font-bold md:font-semibold text-foreground">{sheet.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${sheet.sheetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-2.5 py-1.5"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Sheets</span>
        </a>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
        {kpis.map(({ label, value, color }) => {
          const cls =
            color === "positive"
              ? "text-primary"
              : color === "negative"
                ? "text-destructive"
                : value > 0
                  ? "text-primary"
                  : value < 0
                    ? "text-destructive"
                    : "text-foreground";
          return (
            <div key={label} className="bg-card px-3 md:px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
              <p className={`text-sm md:text-base font-bold tabular-nums leading-none ${cls}`}>
                {value === 0 ? "—" : formatChf(value)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Transactions */}
      {transactions.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground border border-border rounded-xl">
          Aucune transaction.
        </div>
      ) : (
        <>
          {/* Mobile: transaction cards */}
          <div className="md:hidden rounded-xl border border-border overflow-hidden bg-card">
            {transactions.map((tx, i) => (
              <div
                key={`${tx.date}-${i}`}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0"
              >
                {/* Left: colored indicator */}
                <div
                  className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                    tx.in && tx.in > 0 ? "bg-primary" : tx.out && tx.out > 0 ? "bg-destructive" : "bg-border"
                  }`}
                />
                {/* Center: info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tx.description || "—"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    <span className="font-mono">{tx.date}</span>
                    {tx.source ? <span> · {tx.source}</span> : null}
                    {tx.destination ? <span className="text-muted-foreground/60"> → {tx.destination}</span> : null}
                  </p>
                </div>
                {/* Right: amount */}
                <div className="flex-shrink-0 text-right">
                  <AmountBadge tx={tx} />
                  {tx.proof && <p className="text-[10px] text-muted-foreground mt-0.5">{tx.proof}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: full table */}
          <div className="hidden md:block rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-[90px_1fr_1fr_1fr_130px_48px] gap-3 px-4 py-2 bg-muted/40 border-b border-border">
              {["Date", "Description", "Source", "Destination"].map((col) => (
                <span key={col} className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">
                  {col}
                </span>
              ))}
              <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground text-right">
                Montant
              </span>
              <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground text-center">
                Pièce
              </span>
            </div>
            {transactions.map((tx, i) => (
              <div
                key={`${tx.date}-${i}`}
                className="grid grid-cols-[90px_1fr_1fr_1fr_130px_48px] gap-3 items-center px-4 py-2 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <span className="text-xs text-muted-foreground font-mono tabular-nums">{tx.date}</span>
                <span className="text-xs text-foreground truncate">{tx.description || "—"}</span>
                <span className="text-xs text-muted-foreground truncate">{tx.source}</span>
                <span className="text-xs text-muted-foreground truncate">{tx.destination}</span>
                <div className="text-xs text-right">
                  <AmountBadge tx={tx} />
                </div>
                <span className="text-xs text-muted-foreground text-center">{tx.proof || "—"}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
