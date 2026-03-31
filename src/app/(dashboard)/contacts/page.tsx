import { UserRound } from "lucide-react";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { ContactsTabs } from "@/components/contacts-tabs";
import { getSession } from "@/services/auth";
import { getSheetValues, sheetRange } from "@/lib/google/sheets";
import { getSpreadsheetId } from "@/services/sheets";
import {
  COMMERCE_TYPES,
  PERSON_TYPES,
  SOURCE_TYPES,
  parseContacts,
} from "@/services/contacts";
import type { Contact } from "@/services/contacts";
import { getSelectedYear } from "@/services/year";

function PersonTable({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <div className="border border-border py-10 font-mono text-sm text-muted-foreground text-center">
        Aucune personne.
      </div>
    );
  }
  return (
    <div className="border border-border">
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border">
        <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Nom</span>
      </div>
      {contacts.map((c, i) => (
        <div
          key={c.name}
          className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-white/[0.04] transition-colors"
        >
          <span className="font-mono text-[10px] text-muted-foreground/40 w-5 text-right flex-shrink-0">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-sm text-foreground">{c.name}</span>
        </div>
      ))}
    </div>
  );
}

export default async function ContactsPage() {
  const session = await getSession();
  const selectedYear = await getSelectedYear();
  const spreadsheetId = await getSpreadsheetId(session.accessToken!, selectedYear);
  const rows = await getSheetValues(session.accessToken!, spreadsheetId, sheetRange("Contacts", "A:B"));
  const all = parseContacts(rows);

  const allSpecialTypes = [...COMMERCE_TYPES, ...PERSON_TYPES, ...SOURCE_TYPES];
  const commerces = all.filter((c) => COMMERCE_TYPES.includes(c.type));
  const personnes = all.filter((c) => PERSON_TYPES.includes(c.type));
  const sources = all.filter((c) => SOURCE_TYPES.includes(c.type));
  const others = all.filter((c) => !allSpecialTypes.includes(c.type));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Répertoire</p>
        <h1 className="font-mono text-4xl font-bold text-foreground leading-none">Contacts</h1>
        <p className="font-mono text-xs text-muted-foreground mt-2">{all.length} contacts</p>
      </div>

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        {/* ── Personnes ─────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserRound className="w-4 h-4 text-primary" />
              <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-[0.15em]">
                Personnes
              </h2>
              <span className="font-mono text-xs text-muted-foreground">({personnes.length})</span>
            </div>
            <AddPersonDialog />
          </div>
          <PersonTable contacts={personnes} />
        </div>

        {/* ── Commerces + Sources (client tabs) ─────────────── */}
        <ContactsTabs commerces={commerces} sources={sources} />
      </div>

      {others.length > 0 && (
        <p className="font-mono text-xs text-muted-foreground">
          + {others.length} contact{others.length > 1 ? "s" : ""} non catégorisé{others.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
