import { NextResponse } from "next/server";
import { searchFiles } from "@/lib/google/drive";
import { getSheetValues, getSpreadsheetMeta, sheetRange } from "@/lib/google/sheets";
import { auth } from "@/services/auth";

const SHEET_NAME = "Comptes - 2026";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const files = await searchFiles(
    session.accessToken,
    `name = '${SHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
    1,
  );
  const file = files[0];
  if (!file) {
    return NextResponse.json({ error: `Sheet "${SHEET_NAME}" not found` }, { status: 404 });
  }

  const meta = await getSpreadsheetMeta(session.accessToken, file.id);

  const samples: Record<string, string[][]> = {};
  for (const sheet of meta.sheets) {
    try {
      const values = await getSheetValues(session.accessToken, file.id, sheetRange(sheet.title));
      samples[sheet.title] = values.slice(0, 15);
    } catch (e) {
      samples[sheet.title] = [[`ERROR: ${e instanceof Error ? e.message : String(e)}`]];
    }
  }

  return NextResponse.json({ file, meta, samples }, { status: 200 });
}
