import { ExternalLink, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { TransactionActions } from "@/components/transaction/actions";
import { AddTransactionDialog } from "@/components/transaction/add";
import { DescriptionCell } from "@/components/transaction/description-cell";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SPECIAL_SHEETS } from "@/constants/spreadsheet";
import { formatDevise } from "@/lib/devise";
import { getSheetValues, getSpreadsheetMeta, sheetRange } from "@/lib/sheets";
import { parseTransactions } from "@/lib/transactions";
import { cn, isDriveUrl, toSlug } from "@/lib/utils";
import { getMerchants, getPersons } from "@/services/contacts";
import { getSpreadsheetId } from "@/services/spreadsheet";
import type { AmountBadgeProps, ProofDisplayProps } from "@/types/props";

const ProofDisplay = ({ proof }: ProofDisplayProps) => {
  if (!proof) return <span className="font-mono text-xs text-muted-foreground/30">—</span>;
  if (isDriveUrl(proof))
    return (
      <a
        href={proof}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
      >
        <FileText className="w-3 h-3 shrink-0" />
        Voir
      </a>
    );
  return <span className="font-mono text-xs text-muted-foreground">{proof}</span>;
};

const AmountBadge = ({ tx }: AmountBadgeProps) => {
  if (tx.in !== null && tx.in > 0)
    return <span className="font-mono font-bold tabular-nums text-primary">+{formatDevise(tx.in)}</span>;
  if (tx.out !== null && tx.out > 0)
    return <span className="font-mono font-bold tabular-nums text-destructive">−{formatDevise(tx.out)}</span>;
  return <span className="font-mono text-muted-foreground/30">—</span>;
};

const kpiClass = (color: "positive" | "negative" | "auto", value: number) =>
  color === "positive"
    ? "text-primary"
    : color === "negative"
      ? "text-destructive"
      : value > 0
        ? "text-primary"
        : value < 0
          ? "text-destructive"
          : "text-foreground";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spreadsheetId = await getSpreadsheetId();

  const [meta, persons, merchants] = await Promise.all([
    getSpreadsheetMeta({ spreadsheetId }),
    getPersons(),
    getMerchants(),
  ]);

  const sheet = meta.sheets.find((s) => toSlug(s.title) === slug && !SPECIAL_SHEETS.includes(s.title));
  if (!sheet) notFound();

  const rows = spreadsheetId
    ? await getSheetValues({ spreadsheetId, range: sheetRange({ title: sheet.title, columns: "A:J" }) })
    : [];

  const transactions = parseTransactions(rows);
  const totalIn = transactions.reduce((s, t) => s + (t.in ?? 0), 0);
  const totalOut = transactions.reduce((s, t) => s + (t.out ?? 0), 0);
  const delta = totalIn - totalOut;
  const count = transactions.length;

  const kpis = [
    { label: "Entrées", value: totalIn, color: "positive" as const },
    { label: "Sorties", value: totalOut, color: "negative" as const },
    { label: "Résultat", value: delta, color: "auto" as const },
  ];

  const actionProps = { sheetTitle: sheet.title, persons, merchants };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Événement"
        title={sheet.title}
        subtitle={`${count} transaction${count !== 1 ? "s" : ""}`}
        action={
          <div className="flex items-center gap-2">
            <AddTransactionDialog {...actionProps} />
            <Button variant="outline" size="icon" asChild className="text-muted-foreground hover:text-foreground">
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${sheet.sheetId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        }
      />

      <div className="border border-border">
        <div className="md:hidden divide-y divide-border">
          {kpis.map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3.5 bg-card">
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
              <p className={cn("font-mono text-base font-bold tabular-nums", kpiClass(color, value))}>
                {value === 0 ? "—" : formatDevise(value)}
              </p>
            </div>
          ))}
        </div>
        <div className="hidden md:grid md:grid-cols-3 gap-px bg-border">
          {kpis.map(({ label, value, color }) => (
            <div key={label} className="bg-card px-5 py-5">
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{label}</p>
              <p className={cn("font-mono text-2xl font-bold tabular-nums leading-none", kpiClass(color, value))}>
                {value === 0 ? "—" : formatDevise(value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {count === 0 ? (
        <div className="border border-border py-16 font-mono text-sm text-muted-foreground text-center">
          Aucune transaction.
        </div>
      ) : (
        <Fragment>
          <div className="md:hidden border border-border">
            {transactions.map((tx) => (
              <div key={tx.rowIndex} className="flex items-stretch border-b border-border last:border-0">
                <div
                  className={cn(
                    "w-0.5 shrink-0",
                    tx.in && tx.in > 0 ? "bg-primary" : tx.out && tx.out > 0 ? "bg-destructive" : "bg-border",
                  )}
                />
                <div className="flex items-center gap-3 flex-1 px-4 py-3.5 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      <DescriptionCell description={tx.description || tx.destination || ""} comment={tx.comment} />
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5 truncate">
                      {tx.id && <span className="text-muted-foreground/40">{tx.id} · </span>}
                      <span>{tx.date}</span>
                      {tx.source ? <span> · {tx.source}</span> : null}
                      {tx.destination && tx.description ? (
                        <span className="opacity-60"> · {tx.destination}</span>
                      ) : null}
                    </p>
                    {tx.person && <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{tx.person}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <AmountBadge tx={tx} />
                    {tx.proof && (
                      <p className="mt-0.5">
                        <ProofDisplay proof={tx.proof} />
                      </p>
                    )}
                    <TransactionActions transaction={tx} {...actionProps} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block border border-border">
            <div className="grid grid-cols-[48px_100px_1fr_1fr_1fr_140px_130px_50px_64px] gap-3 px-5 py-2.5 bg-muted/30 border-b border-border">
              {["ID", "Date", "Description", "Source", "Destination", "Exécutant"].map((col) => (
                <span key={col} className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                  {col}
                </span>
              ))}
              <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-right">
                Montant
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-center">
                Pièce
              </span>
              <span />
            </div>
            {transactions.map((tx) => (
              <div
                key={tx.rowIndex}
                className="grid grid-cols-[48px_100px_1fr_1fr_1fr_140px_130px_50px_64px] gap-3 items-center px-5 py-3 border-b border-border last:border-0 hover:bg-white/4 transition-colors group"
              >
                <span className="font-mono text-[10px] text-muted-foreground/40 tabular-nums">{tx.id || "—"}</span>
                <span className="font-mono text-sm text-muted-foreground tabular-nums">{tx.date}</span>
                <span className="min-w-0 text-sm text-foreground">
                  <DescriptionCell description={tx.description} comment={tx.comment} />
                </span>
                <span className="min-w-0 text-sm text-muted-foreground truncate">{tx.source || "—"}</span>
                <span className="min-w-0 text-sm text-muted-foreground truncate">{tx.destination || "—"}</span>
                <span className="min-w-0 text-sm text-muted-foreground truncate">{tx.person || "—"}</span>
                <div className="text-sm text-right">
                  <AmountBadge tx={tx} />
                </div>
                <div className="text-center">
                  <ProofDisplay proof={tx.proof} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <TransactionActions transaction={tx} {...actionProps} />
                </div>
              </div>
            ))}
          </div>
        </Fragment>
      )}
    </div>
  );
}
