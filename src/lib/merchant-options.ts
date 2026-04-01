import { EXTRAS_CONTACTS } from "@/constants/contacts";
import type { Contact } from "@/types/contact";

export type MerchantOption = { key: string; label: string; value: string };

export type MerchantOptions = { merchants: MerchantOption[]; fixed: MerchantOption[] };

export const buildMerchantOptions = (contacts: Contact[]): MerchantOptions => {
  const extras = contacts.filter((m) => EXTRAS_CONTACTS.includes(m.name));
  const regular = contacts.filter((m) => !EXTRAS_CONTACTS.includes(m.name));

  const baseNameCounts = regular.reduce<Record<string, number>>((acc, m) => {
    const base = m.name.split(" - ")[0] ?? m.name;
    acc[base] = (acc[base] ?? 0) + 1;
    return acc;
  }, {});

  const merchants: MerchantOption[] = regular
    .map((m, i) => {
      const base = m.name.split(" - ")[0] ?? m.name;
      const isDuplicate = (baseNameCounts[base] ?? 0) > 1;
      const city = isDuplicate && m.address ? m.address.split(" ")[1] : null;
      const label = city ? `${base} - ${city}` : base;
      return { key: `merchant-${i}`, label, value: m.name };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const fixed: MerchantOption[] = extras.map((m) => ({ key: m.name, label: m.name, value: m.name }));

  return { merchants, fixed };
};
