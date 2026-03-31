// ─── Types ────────────────────────────────────────────────────────────────────

export type Contact = { name: string; type: string };

export const COMMERCE_TYPES = ["Store", "Company"];
export const PERSON_TYPES = ["Person"];
export const SOURCE_TYPES = ["Source"];

export const TYPE_LABELS: Record<string, string> = {
  Store: "Magasin",
  Company: "Entreprise",
  Person: "Personne",
  Source: "Source de paiement",
};

// ─── Parser ───────────────────────────────────────────────────────────────────

export function parseContacts(rows: string[][]): Contact[] {
  return rows
    .slice(1)
    .filter((row) => row[0]?.trim())
    .map((row) => ({ name: row[0].trim(), type: row[1]?.trim() ?? "" }));
}

export function filterPersons(contacts: Contact[]): Contact[] {
  return contacts.filter((c) => PERSON_TYPES.includes(c.type));
}
