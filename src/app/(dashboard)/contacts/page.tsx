import { ContactSection } from "@/components/contact/table";
import { RefreshWatcher } from "@/components/refresh/watcher";
import { PageHeader } from "@/components/ui/page-header";
import { COMMERCE_TYPES, EXTRAS_CONTACTS, PERSONS_TYPES } from "@/constants/contacts";
import { addCommercant, addPerson, getMerchants, getPersons } from "@/services/contacts";
import type { ContactType } from "@/types/contact";

const PERSON_COLUMNS = [{ label: "Nom" }, { label: "IBAN" }];
const MERCHANT_COLUMNS = [{ label: "Nom" }, { label: "Adresse", className: "hidden md:table-cell" }, { label: "Type" }];

const PERSON_FIELDS = [
  { type: "text" as const, key: "name", label: "Nom", placeholder: "Prénom Nom...", required: true },
  { type: "text" as const, key: "iban", label: "IBAN", placeholder: "FR76..." },
  { type: "select" as const, key: "scope", label: "Portée", options: PERSONS_TYPES },
];

const MERCHANT_FIELDS = [
  { type: "text" as const, key: "name", label: "Nom", placeholder: "Nom du commerçant...", required: true },
  { type: "select" as const, key: "type", label: "Type", options: COMMERCE_TYPES, required: true },
  { type: "text" as const, key: "address", label: "Adresse", placeholder: "123 rue de la Paix..." },
];

export default async function ContactsPage() {
  const [persons, allMerchants] = await Promise.all([getPersons(), getMerchants()]);
  const merchants = allMerchants.filter((m) => !EXTRAS_CONTACTS.includes(m.name));
  const total = persons.length + merchants.length;

  async function submitPerson(v: Record<string, string>) {
    "use server";
    await addPerson({
      name: v.name ?? "",
      iban: v.iban?.trim() || undefined,
      type: (v.scope as ContactType) || undefined,
    });
  }

  async function submitMerchant(v: Record<string, string>) {
    "use server";
    await addCommercant({ name: v.name ?? "", type: v.type ?? "", address: v.address?.trim() || undefined });
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Répertoire" title="Contacts" subtitle={`${total} contact${total !== 1 ? "s" : ""}`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <ContactSection
          icon="UserRound"
          title="Personnes"
          contacts={persons}
          columns={PERSON_COLUMNS}
          emptyMessage="Aucune personne."
          addDialog={{ icon: "UserRound", title: "Nouvelle personne", fields: PERSON_FIELDS, onSubmit: submitPerson }}
        />
        <ContactSection
          icon="Building2"
          title="Commerçants"
          contacts={merchants}
          columns={MERCHANT_COLUMNS}
          emptyMessage="Aucun commerçant."
          grouped
          addDialog={{
            icon: "Building2",
            title: "Nouveau commerçant",
            fields: MERCHANT_FIELDS,
            onSubmit: submitMerchant,
          }}
        />
      </div>
      <RefreshWatcher type="contacts" />
    </div>
  );
}
