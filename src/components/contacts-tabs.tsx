"use client";

import { Building2, ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { AddMerchantDialog } from "@/components/add-merchant-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/contact";
import type { ContactsTabsProps } from "@/types/props";

type MerchantGroup = { name: string; type: Contact["type"]; branches: { address?: string }[] };

const TYPE_ORDER: Record<string, number> = { Provider: 0, Company: 1, Store: 2 };

const groupMerchants = (merchants: Contact[]): MerchantGroup[] => {
  const map = new Map<string, MerchantGroup>();
  for (const m of merchants) {
    const existing = map.get(m.name);
    if (existing) existing.branches.push({ address: m.address });
    else map.set(m.name, { name: m.name, type: m.type, branches: [{ address: m.address }] });
  }
  return [...map.values()].sort((a, b) => (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99));
};

export const ContactsTabs = ({ merchants }: ContactsTabsProps) => {
  const groups = groupMerchants(merchants);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (name: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-[0.15em]">Commercants</h2>
          <span className="font-mono text-xs text-muted-foreground">({groups.length})</span>
        </div>
        <AddMerchantDialog />
      </div>

      {groups.length === 0 ? (
        <div className="border border-border py-10 font-mono text-sm text-muted-foreground text-center">
          Aucun commercant.
        </div>
      ) : (
        <div className="border border-border">
          <Table className="table-fixed">
            <colgroup>
              <col className="w-10" />
              <col className="w-44" />
              <col className="w-44" />
              <col className="w-24" />
            </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold" />
                <TableHead className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Nom
                </TableHead>
                <TableHead className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Adresse
                </TableHead>
                <TableHead className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Type
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((g, i) => {
                const isChain = g.branches.length > 1;
                const isOpen = expanded.has(g.name);
                return (
                  <Fragment key={g.name}>
                    <TableRow
                      className={cn(isChain ? "cursor-pointer select-none" : "", "hover:bg-white/[0.04]")}
                      onClick={isChain ? () => toggle(g.name) : undefined}
                    >
                      <TableCell className="font-mono text-[10px] text-muted-foreground/40 text-right">
                        {String(i + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        <span className="flex items-center gap-1.5">
                          {g.name}
                          {isChain && (
                            <span className="font-mono text-[10px] text-muted-foreground/50">×{g.branches.length}</span>
                          )}
                          {isChain &&
                            (isOpen ? (
                              <ChevronDown className="w-3 h-3 text-muted-foreground/60 flex-shrink-0 ml-auto" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-muted-foreground/60 flex-shrink-0 ml-auto" />
                            ))}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground truncate">
                        {isChain ? (
                          <span className="text-muted-foreground/40 italic text-[10px]">chaîne</span>
                        ) : (
                          (g.branches[0]?.address ?? "—")
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{g.type}</TableCell>
                    </TableRow>

                    {isChain &&
                      isOpen &&
                      g.branches.map((b, j) => (
                        <TableRow key={j} className="bg-muted/10 hover:bg-white/[0.03]">
                          <TableCell />
                          <TableCell className="pl-6 font-mono text-[10px] text-muted-foreground/50">
                            #{j + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground truncate">
                            {b.address ?? "—"}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      ))}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
