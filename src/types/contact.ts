import type { COMMERCE_TYPES, PERSONS_TYPES } from "@/constants/contacts";

export type ContactType = (typeof COMMERCE_TYPES)[number] | (typeof PERSONS_TYPES)[number];
export type Contact = { name: string; type: ContactType; iban?: string; address?: string };
