"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PersonSelect } from "@/components/person-select";
import { ProofField } from "@/components/proof-field";
import { cn } from "@/lib/utils";
import type { Contact } from "@/services/contacts";
import type { Transaction, TransactionType } from "@/services/transactions";

interface Props {
  transaction: Transaction;
  spreadsheetId: string;
  sheetTitle: string;
  sheetId: number;
  persons: Contact[];
}

const TYPE_OPTIONS = [
  { value: "in" as const, label: "Entrée", icon: ArrowDownLeft, color: "text-primary", bg: "bg-primary/10" },
  { value: "out" as const, label: "Sortie", icon: ArrowUpRight, color: "text-destructive", bg: "bg-destructive/10" },
  { value: "transfer" as const, label: "Transfert", icon: ArrowLeftRight, color: "text-foreground", bg: "bg-foreground/10" },
] as const;

function toIsoDate(display: string): string {
  const [d, m, y] = display.split(".");
  return `${y}-${m}-${d}`;
}

function toDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function detectType(tx: Transaction): TransactionType {
  if (tx.in && tx.in > 0 && tx.out && tx.out > 0) return "transfer";
  if (tx.in && tx.in > 0) return "in";
  return "out";
}

export function TransactionActions({ transaction, spreadsheetId, sheetTitle, sheetId, persons }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state — initialised from the transaction
  const initialType = detectType(transaction);
  const [type, setType] = useState<TransactionType>(initialType);
  const [date, setDate] = useState(toIsoDate(transaction.date));
  const [amount, setAmount] = useState(
    String(transaction.in ?? transaction.out ?? ""),
  );
  const [source, setSource] = useState(transaction.source);
  const [destination, setDestination] = useState(transaction.destination);
  const [person, setPerson] = useState(transaction.person);
  const [description, setDescription] = useState(transaction.description);
  const [proof, setProof] = useState(transaction.proof);

  function resetEdit() {
    setType(initialType);
    setDate(toIsoDate(transaction.date));
    setAmount(String(transaction.in ?? transaction.out ?? ""));
    setSource(transaction.source);
    setDestination(transaction.destination);
    setPerson(transaction.person);
    setDescription(transaction.description);
    setProof(transaction.proof);
    setError(null);
  }

  function handlePersonChange(name: string) {
    setPerson(name);
    if (name) {
      if (type === "in") setSource(name);
      else if (type === "out") setDestination(name);
    }
  }

  function handleTypeChange(newType: TransactionType) {
    setType(newType);
    if (person) {
      if (newType === "in") { setSource(person); setDestination(""); }
      else if (newType === "out") { setDestination(person); setSource(""); }
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId,
          sheetTitle,
          rowIndex: transaction.rowIndex,
          transaction: {
            date: toDisplayDate(date),
            type,
            amount: parseFloat(amount),
            source,
            destination,
            person,
            description,
            proof,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la modification");
      }
      setEditOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetId, sheetId, rowIndex: transaction.rowIndex }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la suppression");
      }
      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  }

  const showSource = type === "in" || type === "transfer";
  const showDestination = type === "out" || type === "transfer";

  return (
    <>
      {/* Action buttons */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => { resetEdit(); setEditOpen(true); }}
          className="p-1.5 text-muted-foreground/40 hover:text-foreground transition-colors"
          title="Modifier"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="p-1.5 text-muted-foreground/40 hover:text-destructive transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Edit dialog ──────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) resetEdit(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" />
              Modifier la transaction
            </DialogTitle>
            <p className="font-mono text-[10px] text-muted-foreground">{sheetTitle} · ligne {transaction.rowIndex}</p>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Type */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Type</p>
              <div className="grid grid-cols-3 gap-px bg-border border border-border">
                {TYPE_OPTIONS.map(({ value, label, icon: Icon, color, bg }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleTypeChange(value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 text-xs font-mono transition-colors",
                      type === value ? cn(bg, color) : "bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Montant */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Date</p>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Montant (CHF)</p>
                <Input
                  type="number" step="0.01" min="0.01" placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)} required
                />
              </div>
            </div>

            {/* Personne */}
            {persons.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Personne</p>
                <PersonSelect persons={persons} value={person} onValueChange={handlePersonChange} />
              </div>
            )}

            {showSource && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">De (source)</p>
                <Input placeholder="Source..." value={source} onChange={(e) => setSource(e.target.value)} />
              </div>
            )}
            {showDestination && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Vers (destination)</p>
                <Input placeholder="Destination..." value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
            )}

            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Description</p>
              <Input placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Pièce</p>
              <ProofField value={proof} onChange={setProof} />
            </div>

            {error && (
              <p className="font-mono text-xs text-destructive border border-destructive/30 px-3 py-2">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => { setEditOpen(false); resetEdit(); }} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[110px]">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ─────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              Supprimer la transaction
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border border-border px-4 py-3 font-mono text-sm space-y-1">
              <p className="text-foreground">{transaction.description || "—"}</p>
              <p className="text-muted-foreground text-xs">{transaction.date}</p>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Cette action supprime définitivement la ligne {transaction.rowIndex} du sheet.
            </p>
            {error && (
              <p className="font-mono text-xs text-destructive border border-destructive/30 px-3 py-2">{error}</p>
            )}
            <div className="flex justify-end gap-2 pt-1 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} disabled={loading}>
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="min-w-[110px]"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Supprimer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
