"use server";

import { appendSheetRow, deleteSheetRow, getSpreadsheetMeta, sheetRange, updateSheetRow } from "@/lib/sheets";
import { buildTransactionRow } from "@/lib/transactions";
import { getSpreadsheetId } from "@/services/spreadsheet";
import type { NewTransaction } from "@/types/transaction";

export const createTransaction = async ({ sheetTitle, tx }: { sheetTitle: string; tx: NewTransaction }): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId();
  await appendSheetRow({ spreadsheetId, range: sheetRange({ title: sheetTitle, columns: "A:H" }), values: buildTransactionRow(tx) });
};

export const updateTransaction = async ({ sheetTitle, rowIndex, tx }: { sheetTitle: string; rowIndex: number; tx: NewTransaction }): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId();
  await updateSheetRow({ spreadsheetId, range: `'${sheetTitle}'!A${rowIndex}:H${rowIndex}`, values: buildTransactionRow(tx) });
};

export const deleteTransaction = async ({ sheetTitle, rowIndex }: { sheetTitle: string; rowIndex: number }): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId();
  const meta = await getSpreadsheetMeta({ spreadsheetId });
  const sheet = meta.sheets.find((s) => s.title === sheetTitle);
  if (!sheet) throw new Error("Feuille introuvable");
  await deleteSheetRow({ spreadsheetId, sheetId: sheet.sheetId, rowIndex });
};
