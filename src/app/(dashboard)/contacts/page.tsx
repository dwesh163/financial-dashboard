import { Building2, CreditCard, Users } from "lucide-react";
import { getSession } from "@/services/auth";
import { getSheetValues, parseContacts, SPREADSHEET_ID } from "@/services/sheets";

const COMMERCE_TYPES = ["Store", "Company"];
const PERSON_TYPES = ["Person"];
const SOURCE_TYPES = ["Source"];

const TYPE_LABELS: Record<string, string> = {
  Store: "Magasin",
  Company: "Entreprise",
  Person: "Personne",
  Source: "Source de paiement",
};

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const session = await getSession();
  const rows = await getSheetValues(session.accessToken!, SPREADSHEET_ID, "Contacts");
  const all = parseContacts(rows);

  const commerces = all.filter((c) => COMMERCE_TYPES.includes(c.type));
  const personnes = all.filter((c) => PERSON_TYPES.includes(c.type));
  const sources = all.filter((c) => SOURCE_TYPES.includes(c.type));
  const others = all.filter((c) => ![...COMMERCE_TYPES, ...PERSON_TYPES, ...SOURCE_TYPES].includes(c.type));

  const activeTab = type === "personne" ? "personne" : type === "source" ? "source" : "commerce";

  const tabs = [
    { key: "commerce", label: "Commerces", icon: Building2, items: commerces },
    { key: "personne", label: "Personnes", icon: Users, items: personnes },
    { key: "source", label: "Sources", icon: CreditCard, items: sources },
  ];

  const displayed = activeTab === "personne" ? personnes : activeTab === "source" ? sources : commerces;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Contacts</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{all.length} contacts</p>
      </div>

      {/* Tabs — full width on mobile */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
        {tabs.map(({ key, label, icon: Icon, items }) => (
          <a
            key={key}
            href={`/contacts?type=${key}`}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{label}</span>
            <span className={`text-[10px] flex-shrink-0 ${activeTab === key ? "opacity-70" : "opacity-50"}`}>
              ({items.length})
            </span>
          </a>
        ))}
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground border border-border rounded-lg">
          Aucun contact dans cette catégorie.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2 bg-muted/40 border-b border-border">
            <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Nom</span>
            <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">Type</span>
          </div>
          {displayed.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border last:border-0"
            >
              <span className="text-sm text-foreground">{c.name}</span>
              <span className="text-xs text-muted-foreground flex-shrink-0">{TYPE_LABELS[c.type] ?? c.type}</span>
            </div>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <p className="text-xs text-muted-foreground">
          + {others.length} contact{others.length > 1 ? "s" : ""} non catégorisé{others.length > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
