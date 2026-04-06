import type { MerchantOptions } from "@/lib/merchant-options";
import type { Contact } from "@/types/contact";
import type { SheetTab, UploadedFile } from "@/types/google";
import type { NewTransaction, Transaction, TransactionFormValues, TransactionType } from "@/types/transaction";

export type ProvidersProps = { children: React.ReactNode };
export type SidebarProps = {
  sheets: SheetTab[];
  userName: string;
  userImage?: string;
  years: number[];
  selectedYear: number;
};
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
export type TransactionFormProps = {
  sheetTitle: string;
  persons: Contact[];
  merchants: Contact[];
  initial?: Partial<TransactionFormValues>;
  onSubmit: (tx: NewTransaction) => Promise<void>;
  onSuccess: () => void;
  onCancel: () => void;
  submitLabel: string;
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
export type CounterpartSelectProps = { value: string; onValueChange: (v: string) => void; options: MerchantOptions };
export type ProofDisplayProps = { proof: string };
export type AmountBadgeProps = { tx: Transaction };
export type FormFieldProps = { label: string; children: React.ReactNode };
export type ContactTableColumn = { label: string; className?: string };
export type MerchantGroup = { name: string; type: string; branches: { address?: string }[] };
export type ContactIcon = string;
export type ContactSectionProps = {
  icon: ContactIcon;
  title: string;
  contacts: Contact[];
  addDialog: AddDialogProps;
  columns: ContactTableColumn[];
  emptyMessage: string;
  grouped?: boolean;
};
export type DialogTextField = { type: "text"; key: string; label: string; placeholder?: string; required?: boolean };
export type DialogSelectField = {
  type: "select";
  key: string;
  label: string;
  options: readonly string[];
  required?: boolean;
};
export type DialogFieldConfig = DialogTextField | DialogSelectField;
export type AddDialogProps = {
  icon: ContactIcon;
  title: string;
  fields: DialogFieldConfig[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
};
export type FormErrorProps = { message: string };
export type PageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};
