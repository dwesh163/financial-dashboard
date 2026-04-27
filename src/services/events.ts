"use server";

import { SPECIAL_SHEETS } from "@/constants/spreadsheet";
import { cacheKey, getCache, setCache } from "@/lib/cache";
import { getSheetValues, getSpreadsheetMeta, sheetRange } from "@/lib/sheets";
import { parseTransactions } from "@/lib/transactions";
import { toSlug } from "@/lib/utils";
import { getSelectedYear, getSession } from "@/services/auth";
import { getMerchants, getPersons } from "@/services/contacts";
import { getSpreadsheetId } from "@/services/spreadsheet";
import type { EventData } from "@/types/event";
import type { SheetTab } from "@/types/google";

export const getEventSheetsFresh = async (): Promise<SheetTab[]> => {
  const spreadsheetId = await getSpreadsheetId();
  if (!spreadsheetId) return [];
  const meta = await getSpreadsheetMeta({ spreadsheetId });
  return meta.sheets.filter((s) => !SPECIAL_SHEETS.includes(s.title));
};

export const getEventSheets = async (): Promise<SheetTab[]> => {
  const [session, year] = await Promise.all([getSession(), getSelectedYear()]);
  const userId = session.user?.id;
  const key = cacheKey.events(userId, year);

  const cached = await getCache<SheetTab[]>(key);
  if (cached) return cached;

  const fresh = await getEventSheetsFresh();
  await setCache(key, fresh);
  return fresh;
};

export const getEventDataFresh = async ({ slug }: { slug: string }): Promise<EventData | null> => {
  const spreadsheetId = await getSpreadsheetId();
  if (!spreadsheetId) return null;
  const meta = await getSpreadsheetMeta({ spreadsheetId });
  const sheet = meta.sheets.find((s) => toSlug(s.title) === slug && !SPECIAL_SHEETS.includes(s.title));
  if (!sheet) return null;
  const [rows, persons, merchants] = await Promise.all([
    getSheetValues({ spreadsheetId, range: sheetRange({ title: sheet.title, columns: "A:J" }) }),
    getPersons(),
    getMerchants(),
  ]);
  return { sheet, transactions: parseTransactions(rows), spreadsheetId, persons, merchants };
};

export const getEventData = async ({ slug }: { slug: string }): Promise<EventData | null> => {
  const [session, year] = await Promise.all([getSession(), getSelectedYear()]);
  const userId = session.user?.id;
  const key = cacheKey.event(userId, year, slug);

  const cached = await getCache<EventData>(key);
  if (cached) return cached;

  const fresh = await getEventDataFresh({ slug });
  if (fresh) await setCache(key, fresh);
  return fresh;
};
