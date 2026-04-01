import { google } from "googleapis";
import { cache } from "react";
import { getTokens } from "@/services/auth";
import type {
  AppendSheetRowParams,
  CreateSheetParams,
  DeleteSheetRowParams,
  EnsureSheetsParams,
  GetSheetValuesParams,
  GetSpreadsheetMetaParams,
  SheetDefinition,
  SheetRangeParams,
  SpreadsheetMeta,
  UpdateSheetRowParams,
} from "@/types/google";

const sheetsClient = ({
  accessToken,
  refreshToken,
  expiresAt,
}: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}) => {
  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ access_token: accessToken, refresh_token: refreshToken, expiry_date: expiresAt * 1000 });
  return google.sheets({ version: "v4", auth });
};

export const sheetRange = ({ title, columns = "A:Z" }: SheetRangeParams): string => `'${title}'!${columns}`;

const _getSpreadsheetMeta = cache(
  async (
    _accessToken: string,
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    },
    spreadsheetId: string,
  ): Promise<SpreadsheetMeta> => {
    const sheets = sheetsClient(tokens);
    const res = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "spreadsheetId,properties.title,sheets.properties",
    });
    const data = res.data;
    return {
      spreadsheetId: data.spreadsheetId!,
      title: data.properties?.title ?? "Untitled",
      sheets: (data.sheets ?? []).map((s) => ({
        sheetId: s.properties?.sheetId ?? 0,
        title: s.properties?.title ?? "Sheet",
        index: s.properties?.index ?? 0,
      })),
    };
  },
);

const _getSheetValues = cache(
  async (
    _accessToken: string,
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    },
    spreadsheetId: string,
    range: string,
  ): Promise<string[][]> => {
    const sheets = sheetsClient(tokens);
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return (res.data.values as string[][]) ?? [];
  },
);

export const getSpreadsheetMeta = async ({ spreadsheetId }: GetSpreadsheetMetaParams) => {
  const tokens = await getTokens();
  return _getSpreadsheetMeta(tokens.accessToken, tokens, spreadsheetId);
};

export const getSheetValues = async ({ spreadsheetId, range }: GetSheetValuesParams) => {
  const tokens = await getTokens();
  return _getSheetValues(tokens.accessToken, tokens, spreadsheetId, range);
};

export const appendSheetRow = async ({ spreadsheetId, range, values }: AppendSheetRowParams): Promise<void> => {
  const tokens = await getTokens();
  const sheets = sheetsClient(tokens);
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
};

export const updateSheetRow = async ({ spreadsheetId, range, values }: UpdateSheetRowParams): Promise<void> => {
  const tokens = await getTokens();
  const sheets = sheetsClient(tokens);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
};

export const ensureSheets = async ({ spreadsheetId, sheets: sheetDefs }: EnsureSheetsParams): Promise<void> => {
  const tokens = await getTokens();
  const meta = await _getSpreadsheetMeta(tokens.accessToken, tokens, spreadsheetId);
  const existing = new Set(meta.sheets.map((s) => s.title));
  const toCreate: SheetDefinition[] = sheetDefs.filter((d) => !existing.has(d.title));
  if (toCreate.length === 0) return;
  const sheets = sheetsClient(tokens);
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
};

export const createSheet = async ({ spreadsheetId, title, headers }: CreateSheetParams): Promise<void> => {
  const tokens = await getTokens();
  const sheets = sheetsClient(tokens);
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
};

export const deleteSheetRow = async ({ spreadsheetId, sheetId, rowIndex }: DeleteSheetRowParams): Promise<void> => {
  const tokens = await getTokens();
  const sheets = sheetsClient(tokens);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });
};
