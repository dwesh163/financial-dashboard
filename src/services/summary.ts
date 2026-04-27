import { SUMMARY_SHEET } from "@/constants/spreadsheet";
import { cacheKey, getCache, setCache } from "@/lib/cache";
import { parseDevise } from "@/lib/devise";
import { getSheetValues, sheetRange } from "@/lib/sheets";
import { toSlug } from "@/lib/utils";
import { getSelectedYear, getSession } from "@/services/auth";
import { getSpreadsheetId } from "@/services/spreadsheet";
import type { SummaryEvent, SummaryIndicators, SummaryTotals } from "@/types/summary";

type SummaryData = { events: SummaryEvent[]; indicators: SummaryIndicators; totals: SummaryTotals };

export const parseSummary = (rows: string[][]): SummaryData => {
  const lastDataIndex = rows.reduce((last, row, i) => (row.slice(1, 6).some((v) => v?.trim()) ? i : last), -1);
  const eventRows = rows.slice(2, lastDataIndex);

  const events: SummaryEvent[] = eventRows
    .filter((row) => row[0]?.trim())
    .map((row) => {
      const rawTitle = row[0] ?? "";
      const parts = rawTitle.split("\n");
      return {
        title: parts[0]?.trim() ?? rawTitle,
        slug: toSlug(parts[0]?.trim() ?? rawTitle),
        subtitle: parts[1]?.trim() ?? "",
        budgetIn: parseDevise(row[1]),
        budgetOut: parseDevise(row[2]),
        realIn: parseDevise(row[3]),
        realOut: parseDevise(row[4]),
        difference: parseDevise(row[5]),
      };
    });

  const totalRow = rows[lastDataIndex] ?? [];
  const totals: SummaryTotals = {
    budgetIn: parseDevise(totalRow[1]),
    budgetOut: parseDevise(totalRow[2]),
    realIn: parseDevise(totalRow[3]),
    realOut: parseDevise(totalRow[4]),
    difference: parseDevise(totalRow[5]),
  };

  const indicators: SummaryIndicators = {
    soldeInitial: parseDevise(rows[2]?.[8]),
    resultatBudgete: parseDevise(rows[4]?.[8]),
    resultatReel: parseDevise(rows[5]?.[8]),
    etatTheorique: parseDevise(rows[6]?.[8]),
    etatReel: parseDevise(rows[7]?.[8]),
    fortuneTheorique: parseDevise(rows[8]?.[8]),
    fortuneReelle: parseDevise(rows[9]?.[8]),
    ecart: parseDevise(rows[11]?.[8]),
    lastCheck: rows[10]?.[8] ?? "",
  };

  return { events, indicators, totals };
};

export const getSummaryFresh = async (): Promise<SummaryData> => {
  const spreadsheetId = await getSpreadsheetId();
  if (!spreadsheetId) return parseSummary([]);
  const rows = await getSheetValues({ spreadsheetId, range: sheetRange({ title: SUMMARY_SHEET }) });
  return parseSummary(rows);
};

export const getSummary = async (): Promise<SummaryData> => {
  const [session, year] = await Promise.all([getSession(), getSelectedYear()]);
  const userId = session.user?.id;
  const key = cacheKey.summary(userId, year);

  const cached = await getCache<SummaryData>(key);
  if (cached) return cached;

  const fresh = await getSummaryFresh();
  await setCache(key, fresh);
  return fresh;
};
