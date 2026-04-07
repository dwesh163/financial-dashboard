"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDevise } from "@/lib/devise";
import { cn } from "@/lib/utils";
import type { SummaryEvent, SummaryTotals } from "@/types/summary";

type SortKey = keyof Pick<SummaryEvent, "title" | "budgetIn" | "budgetOut" | "realIn" | "realOut" | "difference">;
type SortDir = "asc" | "desc";

const Diff = ({ value }: { value: number }) => {
  if (value === 0) return <span className="font-mono text-muted-foreground/40">—</span>;
  if (value > 0) return <span className="font-mono font-bold tabular-nums text-primary">+{formatDevise(value)}</span>;
  return <span className="font-mono font-bold tabular-nums text-destructive">{formatDevise(value)}</span>;
};

const SortIcon = ({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey | null; sortDir: SortDir }) => {
  if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/40" />;
  if (sortDir === "asc") return <ArrowUp className="w-3 h-3 text-foreground" />;
  return <ArrowDown className="w-3 h-3 text-foreground" />;
};

type SummaryTableProps = {
  events: SummaryEvent[];
  totals: SummaryTotals;
};

export const SummaryTable = ({ events, totals }: SummaryTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = sortKey
    ? [...events].sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        const cmp = typeof va === "string" ? va.localeCompare(vb as string) : (va as number) - (vb as number);
        return sortDir === "asc" ? cmp : -cmp;
      })
    : events;

  const headerBase =
    "text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground flex items-center gap-1 cursor-pointer select-none hover:text-foreground transition-colors";

  const columns: { key: SortKey; label: string; icon?: React.ReactNode; right: boolean }[] = [
    { key: "title", label: "Événement", right: false },
    { key: "budgetIn", label: "Budget In", icon: <TrendingUp className="w-3 h-3" />, right: true },
    { key: "budgetOut", label: "Budget Out", icon: <TrendingDown className="w-3 h-3" />, right: true },
    { key: "realIn", label: "Réel In", icon: <TrendingUp className="w-3 h-3" />, right: true },
    { key: "realOut", label: "Réel Out", icon: <TrendingDown className="w-3 h-3" />, right: true },
    { key: "difference", label: "Bénefice", right: true },
  ];

  return (
    <div className="border border-border">
      <div className="grid grid-cols-[1fr_120px_120px_120px_120px_110px] gap-2 px-5 py-2.5 bg-muted/30 border-b border-border">
        {columns.map(({ key, label, right }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSort(key)}
            className={cn(headerBase, right && "justify-end")}
          >
            {label}
            <SortIcon column={key} sortKey={sortKey} sortDir={sortDir} />
          </button>
        ))}
      </div>

      {sorted.map((event: SummaryEvent) => {
        const hasData = event.realIn !== 0 || event.realOut !== 0;
        return (
          <Link
            key={event.slug}
            href={`/events/${event.slug}`}
            className={cn(
              "grid grid-cols-[1fr_120px_120px_120px_120px_110px] gap-2 items-center px-5 py-3.5 border-b border-border last:border-0 transition-colors group",
              hasData ? "hover:bg-white/4" : "opacity-25 cursor-default pointer-events-none",
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
  );
};
