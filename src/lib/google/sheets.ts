import { cache } from "react";
import { sheetsClient } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SheetTab = { sheetId: number; title: string; index: number };

export type SpreadsheetMeta = {
  spreadsheetId: string;
  title: string;
  sheets: SheetTab[];
};

// ─── A1 notation helper ───────────────────────────────────────────────────────

/**
 * Build a proper A1-notation range from a sheet title and optional column span.
 * Wraps the title in single quotes to handle spaces and special characters.
 * e.g. sheetRange("Caisse 2026", "A:G") → "'Caisse 2026'!A:G"
 */
export function sheetRange(title: string, columns = "A:Z"): string {
  return `'${title}'!${columns}`;
}

// ─── Read operations (memoized per request) ───────────────────────────────────

export const getSpreadsheetMeta = cache(
  async (accessToken: string, spreadsheetId: string): Promise<SpreadsheetMeta> => {
    const sheets = sheetsClient(accessToken);
    const res = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "spreadsheetId,properties.title,sheets.properties",
    });
    const data = res.data;
    return {
      spreadsheetId: data.spreadsheetId!,
      title: data.properties!.title!,
      sheets: (data.sheets ?? []).map((s) => ({
        sheetId: s.properties!.sheetId!,
        title: s.properties!.title!,
        index: s.properties!.index!,
      })),
    };
  },
);

export const getSheetValues = cache(
  async (accessToken: string, spreadsheetId: string, range: string): Promise<string[][]> => {
    const sheets = sheetsClient(accessToken);
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return (res.data.values as string[][]) ?? [];
  },
);

// ─── Write operations ─────────────────────────────────────────────────────────

export async function appendSheetRow(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number)[],
): Promise<void> {
  const sheets = sheetsClient(accessToken);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

export async function updateSheetRow(
  accessToken: string,
  spreadsheetId: string,
  range: string, // e.g. "'Sheet'!A5:H5"
  values: (string | number)[],
): Promise<void> {
  const sheets = sheetsClient(accessToken);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

export async function deleteSheetRow(
  accessToken: string,
  spreadsheetId: string,
  sheetId: number,
  rowIndex: number, // 1-indexed row number in the sheet
): Promise<void> {
  const sheets = sheetsClient(accessToken);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1, // 0-indexed
              endIndex: rowIndex,       // exclusive
            },
          },
        },
      ],
    },
  });
}
