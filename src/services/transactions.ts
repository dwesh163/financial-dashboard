import { parseDevise } from "@/lib/devise";
import type { NewTransaction, Transaction } from "@/types/transaction";

export const parseTransactions = (rows: string[][]): Transaction[] => {
  const dateRe = /^\d{2}\.\d{2}\.\d{4}$/;
  return rows
    .slice(1)
    .map((row, i) => ({ row, rowIndex: i + 2, date: row[0]?.trim() ?? "" }))
    .filter(({ date }) => dateRe.test(date))
    .map(({ row, rowIndex, date }) => ({
      rowIndex,
      date,
      out: row[1]?.trim() ? parseDevise(row[1]) : null,
      in: row[2]?.trim() ? parseDevise(row[2]) : null,
      source: row[3]?.trim() ?? "",
      destination: row[4]?.trim() ?? "",
      person: row[5]?.trim() ?? "",
      merchant: row[6]?.trim() ?? "",
      description: row[7]?.trim() ?? "",
      proof: row[8]?.trim() ?? "",
    }));
};

export const buildTransactionRow = (tx: NewTransaction): (string | number)[] => {
  const outVal = tx.type === "out" ? String(tx.amount) : "";
  const inVal = tx.type === "in" ? String(tx.amount) : "";
  return [tx.date, outVal, inVal, tx.source, tx.destination, tx.person, tx.merchant, tx.description, tx.proof];
};
