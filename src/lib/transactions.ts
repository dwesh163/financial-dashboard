import { parseDevise } from "@/lib/devise";
import type { NewTransaction, Transaction } from "@/types/transaction";

export const formatTransactionId = (n: number) => `#${String(n).padStart(4, "0")}`;

export const parseTransactionIdNumber = (id: string): number | null => {
  if (!id.startsWith("#")) return null;
  const n = parseInt(id.slice(1), 10);
  return Number.isNaN(n) ? null : n;
};

export const parseTransactions = (rows: string[][]): Transaction[] => {
  const dateRe = /^\d{2}\.\d{2}\.\d{4}$/;
  return rows
    .slice(1)
    .map((row, i) => ({ row, rowIndex: i + 2, id: row[0]?.trim() ?? "", date: row[1]?.trim() ?? "" }))
    .filter(({ date }) => dateRe.test(date))
    .map(({ row, rowIndex, id, date }) => ({
      rowIndex,
      id,
      date,
      out: row[2]?.trim() ? parseDevise(row[2]) : null,
      in: row[3]?.trim() ? parseDevise(row[3]) : null,
      source: row[4]?.trim() ?? "",
      destination: row[5]?.trim() ?? "",
      person: row[6]?.trim() ?? "",
      description: row[7]?.trim() ?? "",
      comment: row[8]?.trim() ?? "",
      proof: row[9]?.trim() ?? "",
    }));
};

// Retourne les colonnes B:J (sans l'ID) — utilisé pour les mises à jour
export const buildTransactionRow = (tx: NewTransaction): (string | number)[] => {
  const outVal = tx.type === "out" ? String(tx.amount) : "";
  const inVal = tx.type === "in" ? String(tx.amount) : "";
  return [tx.date, outVal, inVal, tx.source, tx.destination, tx.person, tx.description, "", tx.proof];
};
