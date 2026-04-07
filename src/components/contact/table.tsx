"use client";

import * as Icons from "lucide-react";
import { ChevronDown, ChevronRight, CircleHelp, type LucideIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { AddContactDialog } from "@/components/contact/add";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Contact } from "@/types/contact";
import type { ContactSectionProps, MerchantGroup } from "@/types/props";

// ─── Internals ───────────────────────────────────────────────────────────────

const IndexCell = ({ index }: { index: number }) => (
  <TableCell className="font-mono text-[10px] text-muted-foreground/40 text-right w-10">
    {String(index + 1).padStart(2, "0")}
  </TableCell>
);

const GROUP_ORDER: Record<string, number> = { Prestataire: 0, Entreprise: 1, Magasin: 2 };

const groupContacts = (contacts: Contact[]): MerchantGroup[] => {
  const map = new Map<string, MerchantGroup>();
  for (const m of contacts) {
    const base = m.name.split(" - ")[0] ?? m.name;
    const existing = map.get(base);
    if (existing) existing.branches.push({ address: m.address });
    else map.set(base, { name: base, type: m.type, branches: [{ address: m.address }] });
  }
  return [...map.values()].sort((a, b) => (GROUP_ORDER[a.type] ?? 99) - (GROUP_ORDER[b.type] ?? 99));
};

const resolveIcon = (name: string): LucideIcon => {
  const candidate = (Icons as Record<string, unknown>)[name];
  const isValid =
    typeof candidate === "function" ||
    (candidate !== null && typeof candidate === "object" && "render" in (candidate as object));
  return isValid ? (candidate as LucideIcon) : CircleHelp;
};

// ─── ContactSection ──────────────────────────────────────────────────────────

export const ContactSection = ({
  icon,
  title,
  contacts,
  addDialog,
  columns,
  emptyMessage,
  grouped,
}: ContactSectionProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (name: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const Icon = resolveIcon(icon);
  const groups = grouped ? groupContacts(contacts) : null;
  const count = groups?.length ?? contacts.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <h2 className="font-mono text-sm font-semibold text-foreground uppercase tracking-[0.15em]">{title}</h2>
          <span className="font-mono text-xs text-muted-foreground">({count})</span>
        </div>
        <AddContactDialog {...addDialog} />
      </div>

      {count === 0 ? (
        <div className="border border-border py-10 font-mono text-sm text-muted-foreground text-center">
          {emptyMessage}
        </div>
      ) : (
        <div className="border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-10 text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold" />
                {columns.map(({ label, className }) => (
                  <TableHead
                    key={label}
                    className={cn(
                      "text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-semibold",
                      className,
                    )}
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups
                ? groups.map((g, i) => {
                    const isChain = g.branches.length > 1;
                    const isOpen = expanded.has(g.name);
                    return (
                      <Fragment key={g.name}>
                        <TableRow
                          className={cn(isChain ? "cursor-pointer select-none" : "", "hover:bg-white/4")}
                          onClick={isChain ? () => toggle(g.name) : undefined}
                        >
                          <IndexCell index={i} />
                          <TableCell className="text-sm text-foreground">
                            <span className="flex items-center gap-1.5">
                              {g.name}
                              {isChain && (
                                <span className="font-mono text-[10px] text-muted-foreground/50">
                                  ×{g.branches.length}
                                </span>
                              )}
                              {isChain &&
                                (isOpen ? (
                                  <ChevronDown className="w-3 h-3 text-muted-foreground/60 shrink-0 ml-auto" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-muted-foreground/60 shrink-0 ml-auto" />
                                ))}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground truncate hidden md:table-cell">
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
                            <TableRow key={b.address ?? `${g.name}-${j}`} className="bg-muted/10 hover:bg-white/3">
                              <TableCell />
                              <TableCell className="pl-6 font-mono text-[10px] text-muted-foreground/50">
                                #{j + 1}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground truncate hidden md:table-cell">
                                {b.address ?? "—"}
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          ))}
                      </Fragment>
                    );
                  })
                : contacts.map((c, i) => (
                    <TableRow key={c.name} className="hover:bg-white/4">
                      <IndexCell index={i} />
                      <TableCell className="text-sm text-foreground">{c.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{c.iban ?? "—"}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
