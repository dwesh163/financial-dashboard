import type { Contact } from "@/types/contact";
import type { SheetTab } from "@/types/google";
import type { Transaction } from "@/types/transaction";

export type EventData = {
  sheet: SheetTab;
  transactions: Transaction[];
  spreadsheetId: string;
  persons: Contact[];
  merchants: Contact[];
};
