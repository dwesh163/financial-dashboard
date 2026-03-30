import { NextResponse } from "next/server";
import { auth } from "@/services/auth";
import { findSpreadsheet, getSheetValues, getSpreadsheetMeta } from "@/services/sheets";

const SHEET_NAME = "Comptes - 2026";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const file = await findSpreadsheet(session.accessToken, SHEET_NAME);
  if (!file) {
    return NextResponse.json({ error: `Sheet "${SHEET_NAME}" not found` }, { status: 404 });
  }

  const meta = await getSpreadsheetMeta(session.accessToken, file.id);

  // Sample first 10 rows from each sheet tab to understand the format
  const samples: Record<string, string[][]> = {};
  for (const sheet of meta.sheets) {
    try {
      const values = await getSheetValues(session.accessToken, file.id, sheet.title);
      samples[sheet.title] = values.slice(0, 15);
    } catch (e) {
      samples[sheet.title] = [[`ERROR: ${e instanceof Error ? e.message : String(e)}`]];
    }
  }

  return NextResponse.json({ file, meta, samples }, { status: 200 });
}
