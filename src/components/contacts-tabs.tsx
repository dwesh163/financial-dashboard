"use client";

import { useState } from "react";
import { Building2, CreditCard } from "lucide-react";
import { TYPE_LABELS } from "@/services/contacts";
import type { Contact } from "@/services/contacts";

interface Props {
  commerces: Contact[];
  sources: Contact[];
}

const TABS = [
  { key: "commerce" as const, label: "Commerces", icon: Building2 },
  { key: "source" as const, label: "Sources", icon: CreditCard },
];

export function ContactsTabs({ commerces, sources }: Props) {
  const [active, setActive] = useState<"commerce" | "source">("commerce");
  const items = active === "source" ? sources : commerces;

  return (
    <div className="space-y-3">
      {/* Tab strip */}
      <div className="flex gap-0 border-b border-border">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count = key === "source" ? sources.length : commerces.length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                active === key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{label}</span>
              <span className="font-mono text-xs text-muted-foreground">({count})</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="border border-border py-10 font-mono text-sm text-muted-foreground text-center">
          Aucun contact dans cette catégorie.
        </div>
      ) : (
        <div className="border border-border">
          <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5 bg-muted/30 border-b border-border">
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Nom</span>
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Type</span>
          </div>
          {items.map((c, i) => (
            <div
              key={c.name}
              className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border last:border-0 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-[10px] text-muted-foreground/40 w-5 text-right flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-foreground truncate">{c.name}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground flex-shrink-0">
                {TYPE_LABELS[c.type] ?? c.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
