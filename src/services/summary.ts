import { parseChf } from "@/lib/chf";
import { toSlug } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SummaryEvent = {
  title: string;
  slug: string;
  subtitle: string;
  budgetIn: number;
  budgetOut: number;
  realIn: number;
  realOut: number;
  difference: number;
};

export type SummaryIndicators = {
  soldeInitial: number;
  resultatBudgete: number;
  resultatReel: number;
  etatTheorique: number;
  etatReel: number;
  fortuneTheorique: number;
  fortuneReelle: number;
  ecart: number;
  lastCheck: string;
};

export type SummaryTotals = {
  budgetIn: number;
  budgetOut: number;
  realIn: number;
  realOut: number;
  difference: number;
};

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseSummary(rows: string[][]): {
  events: SummaryEvent[];
  indicators: SummaryIndicators;
  totals: SummaryTotals;
} {
  const eventRows = rows.slice(3, rows.length - 1);

  const events: SummaryEvent[] = eventRows
    .filter((row) => row[0]?.trim())
    .map((row) => {
      const parts = row[0].split("\n");
      return {
        title: parts[0]?.trim() ?? row[0],
        slug: toSlug(parts[0]?.trim() ?? row[0]),
        subtitle: parts[1]?.trim() ?? "",
        budgetIn: parseChf(row[1]),
        budgetOut: parseChf(row[2]),
        realIn: parseChf(row[3]),
        realOut: parseChf(row[4]),
        difference: parseChf(row[5]),
      };
    });

  const totalRow = rows[rows.length - 1] ?? [];
  const totals: SummaryTotals = {
    budgetIn: parseChf(totalRow[1]),
    budgetOut: parseChf(totalRow[2]),
    realIn: parseChf(totalRow[3]),
    realOut: parseChf(totalRow[4]),
    difference: parseChf(totalRow[5]),
  };

  const indicators: SummaryIndicators = {
    soldeInitial: parseChf(rows[2]?.[8]),
    resultatBudgete: parseChf(rows[5]?.[8]),
    resultatReel: parseChf(rows[6]?.[8]),
    etatTheorique: parseChf(rows[7]?.[8]),
    etatReel: parseChf(rows[8]?.[8]),
    fortuneTheorique: parseChf(rows[9]?.[8]),
    fortuneReelle: parseChf(rows[10]?.[8]),
    ecart: parseChf(rows[14]?.[8]),
    lastCheck: rows[13]?.[8] ?? "",
  };

  return { events, indicators, totals };
}
