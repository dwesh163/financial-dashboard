import { cache } from "react";
import { MERCHANTS_HEADERS, PERSONS_HEADERS } from "@/constants/contacts";
import { CONTACTS_SPREADSHEET, FINANCES_FOLDER } from "@/constants/drive";
import { MERCHANTS_SHEET, PERSONS_SHEET } from "@/constants/spreadsheet";
import { createSpreadsheet, getFolder, searchFiles } from "@/lib/drive";
import { appendSheetRow, ensureSheets, getSheetValues, sheetRange } from "@/lib/sheets";
import type { Contact, ContactType } from "@/types/contact";

const getContactsSpreadsheetId = cache(async (): Promise<string> => {
  const financesId = await getFolder({ name: FINANCES_FOLDER });
  const files = await searchFiles({
    query: `name = '${CONTACTS_SPREADSHEET}' and mimeType = 'application/vnd.google-apps.spreadsheet' and '${financesId}' in parents and trashed = false`,
    pageSize: 1,
  });
  const spreadsheetId = files[0]?.id ?? (await createSpreadsheet({ name: CONTACTS_SPREADSHEET, parentId: financesId }));
  await ensureSheets({
    spreadsheetId,
    sheets: [
      { title: PERSONS_SHEET, headers: [...PERSONS_HEADERS] },
      { title: MERCHANTS_SHEET, headers: [...MERCHANTS_HEADERS] },
    ],
  });
  return spreadsheetId;
});

export const getPersons = async (): Promise<Contact[]> => {
  const spreadsheetId = await getContactsSpreadsheetId();
  const rows = await getSheetValues({ spreadsheetId, range: sheetRange({ title: PERSONS_SHEET, columns: "A:C" }) });
  return rows
    .slice(1)
    .filter((r) => r[0]?.trim())
    .map((r) => ({
      name: r[0]?.trim() || "Inconnu",
      type: (r[2]?.trim() as ContactType) || "Person",
      iban: r[1]?.trim() || undefined,
    }));
};

export const getMerchants = async (): Promise<Contact[]> => {
  const spreadsheetId = await getContactsSpreadsheetId();
  const rows = await getSheetValues({ spreadsheetId, range: sheetRange({ title: MERCHANTS_SHEET, columns: "A:C" }) });
  return rows
    .slice(1)
    .filter((r) => r[0]?.trim())
    .map((r) => ({
      name: r[0]?.trim() || "Inconnu",
      type: (r[1]?.trim() as ContactType) || "Store",
      address: r[2]?.trim(),
    }));
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
  const spreadsheetId = await getContactsSpreadsheetId();
  const typeLabel = type ?? "Person";
  await appendSheetRow({
    spreadsheetId,
    range: sheetRange({ title: PERSONS_SHEET, columns: "A:C" }),
    values: [name, iban ?? "", typeLabel],
  });
};

export const addMerchant = async ({
  name,
  type,
  address,
}: {
  name: string;
  type: string;
  address?: string;
}): Promise<void> => {
  const spreadsheetId = await getContactsSpreadsheetId();
  const typeLabel = type ?? "Store";
  await appendSheetRow({
    spreadsheetId,
    range: sheetRange({ title: MERCHANTS_SHEET, columns: "A:C" }),
    values: [name, typeLabel, address ?? ""],
  });
};
