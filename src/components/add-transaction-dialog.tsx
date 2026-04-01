"use client";

import { Fragment } from "react";
import { FileText, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTransaction } from "@/app/actions";
import { PersonSelect } from "@/components/person-select";
import { ProofField } from "@/components/proof-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BANK_ACCOUNT, TRANSACTION_TYPE_OPTIONS as TYPE_OPTIONS } from "@/constants/transactions";
import { cn } from "@/lib/utils";
import type { AddTransactionDialogProps } from "@/types/props";
import type { TransactionType } from "@/types/transaction";

const toDisplayDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

const todayIso = (): string => new Date().toISOString().split("T")[0]!;

export const AddTransactionDialog = ({ sheetTitle, persons, merchants }: AddTransactionDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>("out");
  const [date, setDate] = useState(todayIso);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState(BANK_ACCOUNT);
  const [destination, setDestination] = useState("");
  const [person, setPerson] = useState("");
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [proof, setProof] = useState("");

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === "in") {
      setSource("");
      setDestination(BANK_ACCOUNT);
    } else {
      setSource(BANK_ACCOUNT);
      setDestination("");
    }
  };

  const resetForm = () => {
    setType("out");
    setDate(todayIso());
    setAmount("");
    setSource(BANK_ACCOUNT);
    setDestination("");
    setPerson("");
    setMerchant("");
    setDescription("");
    setProof("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createTransaction({
        sheetTitle,
        tx: {
          date: toDisplayDate(date),
          type,
          amount: parseFloat(amount),
          source,
          destination,
          person,
          merchant,
          description,
          proof,
        },
      });
      setOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2 h-8 font-mono text-xs">
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
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Type</p>
              <div className="grid grid-cols-2 gap-px bg-border border border-border">
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Source</p>
                {type === "out" ? (
                  <div className="h-9 px-3 border border-border flex items-center font-mono text-xs text-muted-foreground bg-muted/30">
                    {BANK_ACCOUNT}
                  </div>
                ) : (
                  <Input placeholder="Provenance..." value={source} onChange={(e) => setSource(e.target.value)} />
                )}
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Destination</p>
                {type === "in" ? (
                  <div className="h-9 px-3 border border-border flex items-center font-mono text-xs text-muted-foreground bg-muted/30">
                    {BANK_ACCOUNT}
                  </div>
                ) : (
                  <Input
                    placeholder="Bénéficiaire..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                )}
              </div>
            </div>

            {persons.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Exécutant</p>
                <PersonSelect
                  persons={persons}
                  value={person}
                  onValueChange={setPerson}
                  placeholder="Associer une personne..."
                />
              </div>
            )}

            {merchants.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Marchant</p>
                <Select value={merchant} onValueChange={setMerchant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un marchant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {merchants.map((m) => (
                      <SelectItem key={m.name} value={m.name}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Description</p>
              <Input
                placeholder="Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Pièce</p>
              <ProofField value={proof} onChange={setProof} />
            </div>

            {error && (
              <p className="font-mono text-xs text-destructive border border-destructive/30 px-3 py-2">{error}</p>
            )}

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
              <Button type="submit" disabled={loading} className="min-w-24">
                {loading ? (
                  <Fragment>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Envoi...
                  </Fragment>
                ) : (
                  <Fragment>
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter
                  </Fragment>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};
