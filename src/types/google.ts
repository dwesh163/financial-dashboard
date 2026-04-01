export type DriveFile = { id: string; name: string };
export type UploadedFile = { id: string; name: string; webViewLink: string };
export type SheetTab = { sheetId: number; title: string; index: number };
export type SpreadsheetMeta = { spreadsheetId: string; title: string; sheets: SheetTab[] };

export type GetSpreadsheetMetaParams = { spreadsheetId: string };
export type GetSheetValuesParams = { spreadsheetId: string; range: string };
export type AppendSheetRowParams = { spreadsheetId: string; range: string; values: (string | number)[] };
export type UpdateSheetRowParams = { spreadsheetId: string; range: string; values: (string | number)[] };
export type DeleteSheetRowParams = { spreadsheetId: string; sheetId: number; rowIndex: number };
export type SheetRangeParams = { title: string; columns?: string };
export type SheetDefinition = { title: string; headers?: string[] };
export type EnsureSheetsParams = { spreadsheetId: string; sheets: SheetDefinition[] };
export type CreateSheetParams = { spreadsheetId: string; title: string; headers?: readonly string[] };
