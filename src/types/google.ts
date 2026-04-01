export type DriveFile = { id: string; name: string };
export type UploadedFile = { id: string; name: string; webViewLink: string };
export type SheetTab = { sheetId: number; title: string; index: number };
export type SpreadsheetMeta = { spreadsheetId: string; title: string; sheets: SheetTab[] };

export type SheetDefinition = { title: string; headers?: string[] };
