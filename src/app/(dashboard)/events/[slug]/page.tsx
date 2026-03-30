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
      <span className="inline-flex items-center gap-1 text-primary font-medium">
        <ArrowUpRight className="w-3 h-3" />+{formatChf(tx.in)}
      </span>
    );
  }
  if (tx.out !== null && tx.out > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-destructive font-medium">
        <ArrowDownLeft className="w-3 h-3" />-{formatChf(tx.out)}
      </span>
    );
  }
  return <span className="text-muted-foreground">—</span>;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/" className="hover:text-foreground transition-colors">
              Comptes
            </Link>
            <span>/</span>
            <span>Événements</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">{sheet.title}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${sheet.sheetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ouvrir dans Sheets
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total entrées", value: totalIn, positive: true },
          { label: "Total sorties", value: totalOut, positive: false },
          { label: "Résultat net", value: delta, colored: true },
        ].map(({ label, value, positive, colored }) => (
          <div key={label} className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">{label}</p>
            <p
              className={`text-xl font-semibold tabular-nums ${
                colored
                  ? value > 0
                    ? "text-primary"
                    : value < 0
                      ? "text-destructive"
                      : "text-foreground"
                  : positive
                    ? "text-primary"
                    : "text-destructive"
              }`}
            >
              {value === 0 ? "—" : formatChf(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      {transactions.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground bg-card border border-border rounded-xl">
          Aucune transaction pour cet événement.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Head */}
          <div className="grid grid-cols-[90px_1fr_1fr_1fr_130px_48px] gap-3 px-4 py-2.5 border-b border-border bg-muted/50">
            <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Date</span>
            <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Description</span>
            <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Source</span>
            <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">Destination</span>
            <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-right">
              Montant
            </span>
            <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground text-center">
              Pièce
            </span>
          </div>

          {transactions.map((tx, i) => (
            <div
              key={`${tx.date}-${i}`}
              className="grid grid-cols-[90px_1fr_1fr_1fr_130px_48px] gap-3 items-center px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <span className="text-xs text-muted-foreground font-mono tabular-nums">{tx.date}</span>
              <span className="text-xs text-foreground truncate">{tx.description || "—"}</span>
              <span className="text-xs text-muted-foreground truncate">{tx.source}</span>
              <span className="text-xs text-muted-foreground truncate">{tx.destination}</span>
              <div className="text-xs text-right tabular-nums">
                <AmountBadge tx={tx} />
              </div>
              <span className="text-xs text-muted-foreground text-center">{tx.proof || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
