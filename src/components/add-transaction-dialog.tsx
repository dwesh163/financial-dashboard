"use client";

import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, FileText, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PersonSelect } from "@/components/person-select";
import { ProofField } from "@/components/proof-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Contact } from "@/services/contacts";
import type { TransactionType } from "@/services/transactions";

interface Props {
  spreadsheetId: string;
  sheetTitle: string;
  persons: Contact[];
}

const TYPE_OPTIONS = [
  { value: "in" as const, label: "Entrée", icon: ArrowDownLeft, color: "text-primary", bg: "bg-primary/10" },
  { value: "out" as const, label: "Sortie", icon: ArrowUpRight, color: "text-destructive", bg: "bg-destructive/10" },
  {
    value: "transfer" as const,
    label: "Transfert",
    icon: ArrowLeftRight,
    color: "text-foreground",
    bg: "bg-foreground/10",
  },
] as const;

function toDisplayDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

export function AddTransactionDialog({ spreadsheetId, sheetTitle, persons }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState<TransactionType>("out");
  const [date, setDate] = useState(todayIso);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [person, setPerson] = useState("");
  const [description, setDescription] = useState("");
  const [proof, setProof] = useState("");

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
      if (newType === "in") {
        setSource(person);
        setDestination("");
      } else if (newType === "out") {
        setDestination(person);
        setSource("");
      }
    }
  }

  function resetForm() {
    setType("out");
    setDate(todayIso());
    setAmount("");
    setSource("");
    setDestination("");
    setPerson("");
    setDescription("");
    setProof("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadsheetId,
          sheetTitle,
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
        throw new Error(data.error ?? "Erreur lors de l'ajout");
      }

      setOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  const showSource = type === "in" || type === "transfer";
  const showDestination = type === "out" || type === "transfer";

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2 font-mono text-xs">
        <Plus className="w-3.5 h-3.5" />
        Ajouter
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Nouvelle transaction
            </DialogTitle>
            <p className="font-mono text-[10px] text-muted-foreground">{sheetTitle}</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Personne */}
            {persons.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Personne</p>
                <PersonSelect
                  persons={persons}
                  value={person}
                  onValueChange={handlePersonChange}
                  placeholder="Associer une personne..."
                />
              </div>
            )}

            {/* Source */}
            {showSource && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">De (source)</p>
                <Input placeholder="Source / compte..." value={source} onChange={(e) => setSource(e.target.value)} />
              </div>
            )}

            {/* Destination */}
            {showDestination && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Vers (destination)</p>
                <Input
                  placeholder="Destination / bénéficiaire..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Description</p>
              <Input
                placeholder="Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Pièce */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Pièce</p>
              <ProofField value={proof} onChange={setProof} />
            </div>

            {/* Error */}
            {error && (
              <p className="font-mono text-xs text-destructive border border-destructive/30 px-3 py-2">{error}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[100px]">
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
