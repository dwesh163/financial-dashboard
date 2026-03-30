const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

export const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;
export const SPECIAL_SHEETS = ["Summary", "Contacts"];

// ─── Types ────────────────────────────────────────────────────────────────────

export type SheetTab = { sheetId: number; title: string; index: number };

export type SpreadsheetMeta = {
  spreadsheetId: string;
  title: string;
  sheets: SheetTab[];
};

export type SummaryEvent = {
  title: string;
  slug: string;
  subtitle: string;
  budgetIn: number;
  budgetOut: number;
  realIn: number;
  realOut: number;
  difference: number;
};

export type SummaryIndicators = {
  soldeInitial: number;
  resultatBudgete: number;
  resultatReel: number;
  etatTheorique: number;
  etatReel: number;
  fortuneTheorique: number;
  fortuneReelle: number;
  ecart: number;
  lastCheck: string;
};

export type Transaction = {
  date: string;
  out: number | null;
  in: number | null;
  source: string;
  destination: string;
  description: string;
  proof: string;
};

export type Contact = { name: string; type: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseChf(s: string | undefined): number {
  if (!s?.trim()) return 0;
  const clean = s
    .replace(/Fr\.\s*/gi, "")
    .replace(/'/g, "")
    .trim();
  if (!clean || /^-\s*$/.test(clean)) return 0;
  const negative = clean.startsWith("-");
  const n = parseFloat(clean.replace("-", "").replace(/\s/g, ""));
  return Number.isNaN(n) ? 0 : negative ? -n : n;
}

export function formatChf(n: number): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
  }).format(n);
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

export function parseSummary(rows: string[][]): {
  events: SummaryEvent[];
  indicators: SummaryIndicators;
  totals: { budgetIn: number; budgetOut: number; realIn: number; realOut: number; difference: number };
} {
  // Event rows: index 3 to length-2 (last row = Total)
  const eventRows = rows.slice(3, rows.length - 1);

  const events: SummaryEvent[] = eventRows
    .filter((row) => row[0]?.trim())
    .map((row) => {
      const parts = row[0].split("\n");
      return {
        title: parts[0]?.trim() ?? row[0],
        slug: toSlug(parts[0]?.trim() ?? row[0]),
        subtitle: parts[1]?.trim() ?? "",
        budgetIn: parseChf(row[1]),
        budgetOut: parseChf(row[2]),
        realIn: parseChf(row[3]),
        realOut: parseChf(row[4]),
        difference: parseChf(row[5]),
      };
    });

  const totalRow = rows[rows.length - 1] ?? [];
  const totals = {
    budgetIn: parseChf(totalRow[1]),
    budgetOut: parseChf(totalRow[2]),
    realIn: parseChf(totalRow[3]),
    realOut: parseChf(totalRow[4]),
    difference: parseChf(totalRow[5]),
  };

  const indicators: SummaryIndicators = {
    soldeInitial: parseChf(rows[2]?.[8]),
    resultatBudgete: parseChf(rows[5]?.[8]),
    resultatReel: parseChf(rows[6]?.[8]),
    etatTheorique: parseChf(rows[7]?.[8]),
    etatReel: parseChf(rows[8]?.[8]),
    fortuneTheorique: parseChf(rows[9]?.[8]),
    fortuneReelle: parseChf(rows[10]?.[8]),
    ecart: parseChf(rows[14]?.[8]),
    lastCheck: rows[13]?.[8] ?? "",
  };

  return { events, indicators, totals };
}

export function parseTransactions(rows: string[][]): Transaction[] {
  const dateRe = /^\d{2}\.\d{2}\.\d{4}$/;
  return rows
    .slice(1)
    .filter((row) => row[0] && dateRe.test(row[0].trim()))
    .map((row) => ({
      date: row[0].trim(),
      out: row[1]?.trim() ? parseChf(row[1]) : null,
      in: row[2]?.trim() ? parseChf(row[2]) : null,
      source: row[3]?.trim() ?? "",
      destination: row[4]?.trim() ?? "",
      description: row[5]?.trim() ?? "",
      proof: row[6]?.trim() ?? "",
    }));
}

export function parseContacts(rows: string[][]): Contact[] {
  return rows
    .slice(1)
    .filter((row) => row[0]?.trim())
    .map((row) => ({ name: row[0].trim(), type: row[1]?.trim() ?? "" }));
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function getSpreadsheetMeta(accessToken: string, spreadsheetId: string): Promise<SpreadsheetMeta> {
  const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Sheets metadata error: ${res.status}`);
  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties.title,
    sheets: data.sheets.map((s: { properties: { sheetId: number; title: string; index: number } }) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      index: s.properties.index,
    })),
  };
}

export async function getSheetValues(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
): Promise<string[][]> {
  const range = encodeURIComponent(sheetTitle);
  const res = await fetch(`${SHEETS_BASE}/${spreadsheetId}/values/${range}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Sheets values error: ${res.status} on "${sheetTitle}"`);
  const data = await res.json();
  return data.values ?? [];
}

export async function findSpreadsheet(accessToken: string, name: string): Promise<{ id: string; name: string } | null> {
  const q = encodeURIComponent(
    `name = '${name}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
  );
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=1`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Drive search error: ${res.status}`);
  const data = await res.json();
  return data.files?.[0] ?? null;
}
