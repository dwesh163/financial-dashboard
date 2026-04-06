"use server";

import { cache } from "react";
import { MERCHANTS_HEADERS, PERSONS_HEADERS } from "@/constants/contacts";
import { CONTACTS_SPREADSHEET, FINANCES_FOLDER } from "@/constants/drive";
import { MERCHANTS_SHEET, PERSONS_SHEET } from "@/constants/spreadsheet";
import { createSpreadsheet, getFolder, searchFiles } from "@/lib/drive";
import { appendSheetRow, ensureSheets, getSheetValues, sheetRange, updateSheetRow } from "@/lib/sheets";
import type {
  AddMerchantParams,
  AddPersonParams,
  Contact,
  ContactType,
  ContactWithRow,
  UpdateMerchantNameParams,
} from "@/types/contact";

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

export const getMerchantsWithRows = async (): Promise<ContactWithRow[]> => {
  const spreadsheetId = await getContactsSpreadsheetId();
  const rows = await getSheetValues({ spreadsheetId, range: sheetRange({ title: MERCHANTS_SHEET, columns: "A:C" }) });
  return rows
    .slice(1)
    .map((r, i) => ({ r, rowIndex: i + 2 }))
    .filter(({ r }) => r[0]?.trim())
    .map(({ r, rowIndex }) => ({
      rowIndex,
      contact: {
        name: r[0]?.trim() ?? "",
        type: (r[1]?.trim() as ContactType) || "Store",
        address: r[2]?.trim(),
      },
    }));
};

export const updateMerchantName = async ({ rowIndex, name }: UpdateMerchantNameParams): Promise<void> => {
  const spreadsheetId = await getContactsSpreadsheetId();
  await updateSheetRow({
    spreadsheetId,
    range: `'${MERCHANTS_SHEET}'!A${rowIndex}`,
    values: [name],
  });
};

export const addPerson = async ({ name, iban, type }: AddPersonParams): Promise<void> => {
  const spreadsheetId = await getContactsSpreadsheetId();
  const typeLabel = type ?? "Person";
  await appendSheetRow({
    spreadsheetId,
    range: sheetRange({ title: PERSONS_SHEET, columns: "A:C" }),
    values: [name, iban ?? "", typeLabel],
  });
};

export const addMerchant = async ({ name, type, address }: AddMerchantParams): Promise<void> => {
  const spreadsheetId = await getContactsSpreadsheetId();
  const typeLabel = type ?? "Store";
  await appendSheetRow({
    spreadsheetId,
    range: sheetRange({ title: MERCHANTS_SHEET, columns: "A:C" }),
    values: [name, typeLabel, address ?? ""],
  });
};

export const addCommercant = async ({ name, type, address }: AddMerchantParams): Promise<void> => {
  const existing = await getMerchantsWithRows();
  const baseName = name.split(" - ")[0] ?? name;
  const match = existing.find(({ contact: m }) => (m.name.split(" - ")[0] ?? m.name) === baseName);
  if (match) {
    const hasNoSuffix = !match.contact.name.includes(" - ");
    if (hasNoSuffix && match.contact.address) {
      const city = match.contact.address.split(" ")[1] ?? match.contact.address;
      await updateMerchantName({ rowIndex: match.rowIndex, name: `${baseName} - ${city}` });
    }
    const newCity = address?.split(" ")[1] ?? address ?? "";
    await addMerchant({ name: `${baseName} - ${newCity}`, type, address });
  } else {
    await addMerchant({ name: baseName, type, address });
  }
};
