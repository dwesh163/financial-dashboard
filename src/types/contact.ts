import type { COMMERCE_TYPES, PERSONS_TYPES } from "@/constants/contacts";

export type ContactType = (typeof COMMERCE_TYPES)[number] | (typeof PERSONS_TYPES)[number];
export type Contact = { name: string; type: ContactType; iban?: string; address?: string };
export type ContactWithRow = { rowIndex: number; contact: Contact };
export type UpdateMerchantNameParams = { rowIndex: number; name: string };
export type AddPersonParams = { name: string; iban?: string; type?: ContactType };
export type AddMerchantParams = { name: string; type: string; address?: string };
