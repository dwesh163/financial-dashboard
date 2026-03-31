import { parseChf } from "@/lib/chf";
import { appendSheetRow, deleteSheetRow, sheetRange, updateSheetRow } from "@/lib/google/sheets";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Transaction = {
  rowIndex: number; // 1-indexed row in the sheet (row 1 = header, row 2 = first data row)
  date: string;
  out: number | null;
  in: number | null;
  source: string; // D
  destination: string; // E
  person: string; // F
  description: string; // G
  proof: string; // H
};

export type TransactionType = "in" | "out" | "transfer";

export type NewTransaction = {
  date: string; // DD.MM.YYYY
  type: TransactionType;
  amount: number;
  source: string;
  destination: string;
  person: string;
  description: string;
  proof: string;
};

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseTransactions(rows: string[][]): Transaction[] {
  const dateRe = /^\d{2}\.\d{2}\.\d{4}$/;
  return rows
    .slice(1)
    .map((row, i) => ({ row, rowIndex: i + 2 })) // +1 for 0→1 index, +1 for header row
    .filter(({ row }) => row[0] && dateRe.test(row[0].trim()))
    .map(({ row, rowIndex }) => ({
      rowIndex,
      date: row[0].trim(),
      out: row[1]?.trim() ? parseChf(row[1]) : null,
      in: row[2]?.trim() ? parseChf(row[2]) : null,
      source: row[3]?.trim() ?? "",
      destination: row[4]?.trim() ?? "",
      person: row[5]?.trim() ?? "",
      description: row[6]?.trim() ?? "",
      proof: row[7]?.trim() ?? "",
    }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildRow(tx: NewTransaction): (string | number)[] {
  const outVal = tx.type === "out" || tx.type === "transfer" ? String(tx.amount) : "";
  const inVal = tx.type === "in" || tx.type === "transfer" ? String(tx.amount) : "";
  return [tx.date, outVal, inVal, tx.source, tx.destination, tx.person, tx.description, tx.proof];
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function addTransaction(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  tx: NewTransaction,
): Promise<void> {
  await appendSheetRow(accessToken, spreadsheetId, sheetRange(sheetTitle, "A:H"), buildRow(tx));
}

export async function updateTransaction(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  rowIndex: number,
  tx: NewTransaction,
): Promise<void> {
  const range = `'${sheetTitle}'!A${rowIndex}:H${rowIndex}`;
  await updateSheetRow(accessToken, spreadsheetId, range, buildRow(tx));
}

export async function deleteTransaction(
  accessToken: string,
  spreadsheetId: string,
  sheetId: number,
  rowIndex: number,
): Promise<void> {
  await deleteSheetRow(accessToken, spreadsheetId, sheetId, rowIndex);
}
