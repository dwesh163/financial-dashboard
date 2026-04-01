import { UserRound } from "lucide-react";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { ContactsTabs } from "@/components/contacts-tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMerchants, getPersons } from "@/services/contacts";
import type { Contact } from "@/types/contact";

const PersonTable = ({ contacts }: { contacts: Contact[] }) => {
  if (contacts.length === 0)
    return (
      <div className="border border-border py-10 font-mono text-sm text-muted-foreground text-center">
        Aucune personne.
      </div>
    );
  return (
    <div className="border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-10 text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold" />
            <TableHead className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Nom
            </TableHead>
            <TableHead className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              IBAN
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((c, i) => (
            <TableRow key={c.name} className="hover:bg-white/[0.04]">
              <TableCell className="font-mono text-[10px] text-muted-foreground/40 text-right w-10">
                {String(i + 1).padStart(2, "0")}
              </TableCell>
              <TableCell className="text-sm text-foreground">{c.name}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{c.iban ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default async function ContactsPage() {
  const [persons, merchants] = await Promise.all([getPersons(), getMerchants()]);

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-border">
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Répertoire</p>
        <h1 className="font-mono text-4xl font-bold text-foreground leading-none">Contacts</h1>
        <p className="font-mono text-xs text-muted-foreground mt-2">{persons.length + merchants.length} contacts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserRound className="w-4 h-4 text-primary" />
              <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-[0.15em]">Personnes</h2>
              <span className="font-mono text-xs text-muted-foreground">({persons.length})</span>
            </div>
            <AddPersonDialog />
          </div>
          <PersonTable contacts={persons} />
        </div>

        <ContactsTabs merchants={merchants} />
      </div>
    </div>
  );
}
