import { google } from "googleapis";
import { withGoogleAuth } from "@/lib/google";
import { getTokens } from "@/services/auth";
import type { SheetDefinition, SpreadsheetMeta } from "@/types/google";

const sheetsClient = async () => {
  const token = await getTokens();
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.expiresAt * 1000,
  });
  return google.sheets({ version: "v4", auth });
};

export const sheetRange = ({ title, columns = "A:Z" }: { title: string; columns?: string }): string =>
  `'${title}'!${columns}`;

export const getSpreadsheetMeta = ({ spreadsheetId }: { spreadsheetId: string }): Promise<SpreadsheetMeta> =>
  withGoogleAuth(async () => {
    const sheets = await sheetsClient();
    const res = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "spreadsheetId,properties.title,sheets.properties",
    });
    const data = res.data;
    if (!data.spreadsheetId || !data.properties?.title || !data.sheets) throw new Error("Invalid spreadsheet data");
    return {
      spreadsheetId: data.spreadsheetId,
      title: data.properties?.title ?? "Untitled",
      sheets: (data.sheets ?? []).map((s) => ({
        sheetId: s.properties?.sheetId ?? 0,
        title: s.properties?.title ?? "Sheet",
        index: s.properties?.index ?? 0,
      })),
    };
  });

export const getSheetValues = ({
  spreadsheetId,
  range,
}: {
  spreadsheetId: string;
  range: string;
}): Promise<string[][]> =>
  withGoogleAuth(async () => {
    const sheets = await sheetsClient();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return (res.data.values as string[][]) ?? [];
  });

export const appendSheetRow = ({
  spreadsheetId,
  range,
  values,
}: {
  spreadsheetId: string;
  range: string;
  values: (string | number)[];
}): Promise<void> =>
  withGoogleAuth(async () => {
    const sheets = await sheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [values] },
    });
  });

export const updateSheetRow = ({
  spreadsheetId,
  range,
  values,
}: {
  spreadsheetId: string;
  range: string;
  values: (string | number)[];
}): Promise<void> =>
  withGoogleAuth(async () => {
    const sheets = await sheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    });
  });

export const ensureSheets = ({
  spreadsheetId,
  sheets: sheetDefs,
}: {
  spreadsheetId: string;
  sheets: SheetDefinition[];
}): Promise<void> =>
  withGoogleAuth(async () => {
    const meta = await getSpreadsheetMeta({ spreadsheetId });
    const existing = new Set(meta.sheets.map((s) => s.title));
    const toCreate: SheetDefinition[] = sheetDefs.filter((d) => !existing.has(d.title));
    if (toCreate.length === 0) return;
    const sheets = await sheetsClient();
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: toCreate.map((d) => ({ addSheet: { properties: { title: d.title } } })) },
    });
    for (const def of toCreate) {
      if (!def.headers?.length) continue;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: sheetRange({ title: def.title, columns: `A1:${String.fromCharCode(64 + def.headers.length)}1` }),
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [def.headers] },
      });
    }
  });

export const createSheet = ({
  spreadsheetId,
  title,
  headers,
}: {
  spreadsheetId: string;
  title: string;
  headers?: readonly string[];
}): Promise<void> =>
  withGoogleAuth(async () => {
    const sheets = await sheetsClient();
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    });
    if (headers?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: sheetRange({ title, columns: `A1:${String.fromCharCode(64 + headers.length)}1` }),
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[...headers]] },
      });
    }
  });

export const deleteSheetRow = ({
  spreadsheetId,
  sheetId,
  rowIndex,
}: {
  spreadsheetId: string;
  sheetId: number;
  rowIndex: number;
}): Promise<void> =>
  withGoogleAuth(async () => {
    const sheets = await sheetsClient();
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: { sheetId, dimension: "ROWS", startIndex: rowIndex - 1, endIndex: rowIndex },
            },
          },
        ],
      },
    });
  });
