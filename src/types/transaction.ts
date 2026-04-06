export type Transaction = {
  rowIndex: number;
  date: string;
  out: number | null;
  in: number | null;
  source: string;
  destination: string;
  person: string;
  description: string;
  proof: string;
};

export type TransactionType = "in" | "out";

export type NewTransaction = {
  date: string;
  type: TransactionType;
  amount: number;
  source: string;
  destination: string;
  person: string;
  description: string;
  proof: string;
};

export type CreateTransactionParams = { sheetTitle: string; tx: NewTransaction };
export type UpdateTransactionParams = { sheetTitle: string; rowIndex: number; tx: NewTransaction };
export type DeleteTransactionParams = { sheetTitle: string; rowIndex: number };
