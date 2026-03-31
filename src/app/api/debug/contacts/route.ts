import { type NextRequest, NextResponse } from "next/server";
import { appendSheetRow, sheetRange } from "@/lib/google/sheets";
import { auth } from "@/services/auth";
import { getSpreadsheetId } from "@/services/sheets";
import { getSelectedYear } from "@/services/year";

/**
 * POST /api/debug/contacts
 *
 * Ajoute une ou plusieurs personnes dans l'onglet "Contacts" du spreadsheet.
 *
 * Body JSON :
 *   { "persons": ["Alice Dupont", "Bob Martin"] }
 *
 * Ou un seul :
 *   { "name": "Alice Dupont" }
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  // Accepte { persons: string[] } ou { name: string }
  const names: string[] = Array.isArray(body.persons)
    ? body.persons.filter((n: unknown) => typeof n === "string" && n.trim())
    : typeof body.name === "string" && body.name.trim()
      ? [body.name.trim()]
      : [];

  if (names.length === 0) {
    return NextResponse.json({ error: 'Fournir "persons" (tableau) ou "name" (string)' }, { status: 400 });
  }

  const selectedYear = await getSelectedYear();
  const spreadsheetId = await getSpreadsheetId(session.accessToken, selectedYear);
  const range = sheetRange("Contacts", "A:B");

  const added: string[] = [];
  for (const name of names) {
    await appendSheetRow(session.accessToken, spreadsheetId, range, [name, "Person"]);
    added.push(name);
  }

  return NextResponse.json({ ok: true, added, spreadsheetId });
}
