"use server";

import { appendSheetRow, deleteSheetRow, getSpreadsheetMeta, sheetRange, updateSheetRow } from "@/lib/sheets";
import { buildTransactionRow } from "@/lib/transactions";
import { getSpreadsheetId } from "@/services/spreadsheet";
import type { CreateTransactionParams, DeleteTransactionParams, UpdateTransactionParams } from "@/types/transaction";

export const createTransaction = async ({ sheetTitle, tx }: CreateTransactionParams): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId();
  await appendSheetRow({
    spreadsheetId,
    range: sheetRange({ title: sheetTitle, columns: "A:H" }),
    values: buildTransactionRow(tx),
  });
};

export const updateTransaction = async ({ sheetTitle, rowIndex, tx }: UpdateTransactionParams): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId();
  await updateSheetRow({
    spreadsheetId,
    range: `'${sheetTitle}'!A${rowIndex}:H${rowIndex}`,
    values: buildTransactionRow(tx),
  });
};

export const deleteTransaction = async ({ sheetTitle, rowIndex }: DeleteTransactionParams): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId();
  const meta = await getSpreadsheetMeta({ spreadsheetId });
  const sheet = meta.sheets.find((s) => s.title === sheetTitle);
  if (!sheet) throw new Error("Feuille introuvable");
  await deleteSheetRow({ spreadsheetId, sheetId: sheet.sheetId, rowIndex });
};
