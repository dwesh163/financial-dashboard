import type { Contact } from "@/types/contact";
import type { SheetTab, UploadedFile } from "@/types/google";
import type { Transaction, TransactionType } from "@/types/transaction";

export type ProvidersProps = { children: React.ReactNode };
export type SidebarProps = { sheets: SheetTab[]; userName: string; years: number[]; selectedYear: number };
export type YearSelectorProps = { years: number[]; selectedYear: number };
export type PersonSelectProps = {
  persons: Contact[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};
export type ContactsTabsProps = { merchants: Contact[] };
export type AddTransactionDialogProps = { sheetTitle: string; persons: Contact[]; merchants: Contact[] };
export type TransactionActionsProps = {
  transaction: Transaction;
  sheetTitle: string;
  persons: Contact[];
  merchants: Contact[];
};
export type ProofUploadProps = { onUploaded: (file: UploadedFile) => void; className?: string };
export type ProofFieldProps = { value: string; onChange: (v: string) => void; placeholder?: string };
export type TypeOption = {
  value: TransactionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
};
