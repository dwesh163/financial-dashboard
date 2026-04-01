"use server";

import { TRANSACTION_HEADERS } from "@/constants/transactions";
import { getFolder, uploadFile } from "@/lib/drive";
import {
  appendSheetRow,
  createSheet,
  deleteSheetRow,
  getSpreadsheetMeta,
  sheetRange,
  updateSheetRow,
} from "@/lib/sheets";
import { getSelectedYear, unstable_update } from "@/services/auth";
import { addMerchant, addPerson as addPersonToContacts } from "@/services/contacts";
import { createYearSpreadsheet, getSpreadsheetId } from "@/services/spreadsheet";
import { buildTransactionRow } from "@/services/transactions";
import type { ContactType } from "@/types/contact";
import type { CreateTransactionParams, DeleteTransactionParams, UpdateTransactionParams } from "@/types/transaction";

const getSpreadsheetContext = async () => {
  const spreadsheetId = await getSpreadsheetId();
  return { spreadsheetId };
};

export const setYear = async (year: number): Promise<void> => {
  await unstable_update({ selectedYear: year });
};

export const createYear = async (year: number): Promise<void> => {
  await createYearSpreadsheet(year);
  await unstable_update({ selectedYear: year });
};

export const createEvent = async (name: string): Promise<void> => {
  const spreadsheetId = await getSpreadsheetId();
  if (!spreadsheetId) throw new Error("Aucun classeur sélectionné");
  await createSheet({ spreadsheetId, title: name, headers: TRANSACTION_HEADERS });
};

export const createTransaction = async ({ sheetTitle, tx }: CreateTransactionParams): Promise<void> => {
  const { spreadsheetId } = await getSpreadsheetContext();
  await appendSheetRow({
    spreadsheetId,
    range: sheetRange({ title: sheetTitle, columns: "A:I" }),
    values: buildTransactionRow(tx),
  });
};

export const updateTransaction = async ({ sheetTitle, rowIndex, tx }: UpdateTransactionParams): Promise<void> => {
  const { spreadsheetId } = await getSpreadsheetContext();
  await updateSheetRow({
    spreadsheetId,
    range: `'${sheetTitle}'!A${rowIndex}:I${rowIndex}`,
    values: buildTransactionRow(tx),
  });
};

export const deleteTransaction = async ({ sheetTitle, rowIndex }: DeleteTransactionParams): Promise<void> => {
  const { spreadsheetId } = await getSpreadsheetContext();
  const meta = await getSpreadsheetMeta({ spreadsheetId });
  const sheet = meta.sheets.find((s) => s.title === sheetTitle);
  if (!sheet) throw new Error("Feuille introuvable");
  await deleteSheetRow({ spreadsheetId, sheetId: sheet.sheetId, rowIndex });
};

export const addPerson = async ({
  name,
  iban,
  type,
}: {
  name: string;
  iban?: string;
  type?: ContactType;
}): Promise<void> => {
  await addPersonToContacts({ name, iban, type });
};

export const addCommercant = async ({
  name,
  type,
  address,
}: {
  name: string;
  type: string;
  address?: string;
}): Promise<void> => {
  await addMerchant({ name, type, address });
};

export const uploadProof = async (formData: FormData): Promise<{ id: string; name: string; webViewLink: string }> => {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("Aucun fichier fourni");
  if (file.type !== "application/pdf") throw new Error("Seuls les fichiers PDF sont acceptés");
  const year = await getSelectedYear();
  const financesId = await getFolder({ name: "Finances" });
  const yearId = await getFolder({ name: String(year), parentId: financesId });
  const folderId = await getFolder({ name: "Preuves", parentId: yearId });
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadFile({ folderId, filename: file.name, mimeType: file.type, buffer });
};
