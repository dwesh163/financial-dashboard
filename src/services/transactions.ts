"use server";

import { appendSheetRow, deleteSheetRow, getSheetValues, getSpreadsheetMeta, sheetRange, updateSheetRow } from "@/lib/sheets";
import { buildTransactionRow, formatTransactionId, parseTransactionIdNumber } from "@/lib/transactions";
import { getSpreadsheetId } from "@/services/spreadsheet";
import { SPECIAL_SHEETS } from "@/constants/spreadsheet";
import type { CreateTransactionParams, DeleteTransactionParams, UpdateTransactionParams } from "@/types/transaction";

const getNextTransactionId = async (spreadsheetId: string): Promise<string> => {
  const meta = await getSpreadsheetMeta({ spreadsheetId });
  const eventSheets = meta.sheets.filter((s) => !SPECIAL_SHEETS.includes(s.title));
  const columns = await Promise.all(
    eventSheets.map((s) => getSheetValues({ spreadsheetId, range: sheetRange({ title: s.title, columns: "A:A" }) })),
  );
  let max = 0;
  for (const rows of columns) {
    for (const row of rows.slice(1)) {
      const n = parseTransactionIdNumber(row[0]?.trim() ?? "");
      if (n !== null && n > max) max = n;
    }
  }
  return formatTransactionId(max + 1);
};

export const createTransaction = async ({ sheetTitle, tx }: CreateTransactionParams): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId();
  const id = await getNextTransactionId(spreadsheetId);
  await appendSheetRow({
    spreadsheetId,
    range: sheetRange({ title: sheetTitle, columns: "A:J" }),
    values: [id, ...buildTransactionRow(tx)],
  });
};

export const updateTransaction = async ({ sheetTitle, rowIndex, tx }: UpdateTransactionParams): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId();
  await updateSheetRow({
    spreadsheetId,
    range: `'${sheetTitle}'!B${rowIndex}:J${rowIndex}`,
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
