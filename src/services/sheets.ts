// ─── Re-exports ───────────────────────────────────────────────────────────────
// All Google lib calls

// Formatting & parsing helpers
export { formatChf, parseChf } from "@/lib/chf";
export type { SheetTab, SpreadsheetMeta } from "@/lib/google/sheets";
export { appendSheetRow, getSheetValues, getSpreadsheetMeta } from "@/lib/google/sheets";
export { toSlug } from "@/lib/utils";
export type { Contact } from "@/services/contacts";
export {
  COMMERCE_TYPES,
  filterPersons,
  PERSON_TYPES,
  parseContacts,
  SOURCE_TYPES,
  TYPE_LABELS,
} from "@/services/contacts";
export type { SummaryEvent, SummaryIndicators, SummaryTotals } from "@/services/summary";
// Domain services
export { parseSummary } from "@/services/summary";
export type { NewTransaction, Transaction, TransactionType } from "@/services/transactions";
export { addTransaction, parseTransactions } from "@/services/transactions";

// ─── Constants ────────────────────────────────────────────────────────────────

export const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;
export const SPECIAL_SHEETS = ["Summary", "Contacts"];

// ─── Spreadsheet discovery ────────────────────────────────────────────────────

import { searchFiles } from "@/lib/google/drive";

export async function getSpreadsheetId(accessToken: string, year: number): Promise<string> {
  const files = await searchFiles(
    accessToken,
    `name = 'Comptes - ${year}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
    1,
  );
  return files[0]?.id ?? SPREADSHEET_ID;
}

export async function listYearSpreadsheets(accessToken: string): Promise<number[]> {
  const files = await searchFiles(
    accessToken,
    "name contains 'Comptes - ' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
    50,
  );
  const years: number[] = [];
  for (const file of files) {
    const match = file.name.match(/Comptes - (\d{4})$/);
    if (match) years.push(Number.parseInt(match[1], 10));
  }
  return years.sort((a, b) => b - a);
}
