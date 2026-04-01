"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { deleteTransaction, updateTransaction } from "@/app/actions";
import { PersonSelect } from "@/components/person-select";
import { ProofField } from "@/components/proof-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BANK_ACCOUNT, TRANSACTION_TYPE_OPTIONS as TYPE_OPTIONS } from "@/constants/transactions";
import { cn } from "@/lib/utils";
import type { TransactionActionsProps } from "@/types/props";
import type { TransactionType } from "@/types/transaction";

const toIsoDate = (display: string): string => {
  const [d, m, y] = display.split(".");
  return `${y}-${m}-${d}`;
};

const toDisplayDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
};

const detectType = ({ tx }: { tx: { in: number | null; out: number | null } }): TransactionType => {
  if (tx.in && tx.in > 0) return "in";
  return "out";
};

export const TransactionActions = ({ transaction, sheetTitle, persons, merchants }: TransactionActionsProps) => {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialType = detectType({ tx: transaction });
  const [type, setType] = useState<TransactionType>(initialType);
  const [date, setDate] = useState(toIsoDate(transaction.date));
  const [amount, setAmount] = useState(String(transaction.in ?? transaction.out ?? ""));
  const [source, setSource] = useState(transaction.source);
  const [destination, setDestination] = useState(transaction.destination);
  const [person, setPerson] = useState(transaction.person);
  const [merchant, setMerchant] = useState(transaction.merchant);
  const [description, setDescription] = useState(transaction.description);
  const [proof, setProof] = useState(transaction.proof);

  const resetEdit = () => {
    setType(initialType);
    setDate(toIsoDate(transaction.date));
    setAmount(String(transaction.in ?? transaction.out ?? ""));
    setSource(transaction.source);
    setDestination(transaction.destination);
    setPerson(transaction.person);
    setMerchant(transaction.merchant);
    setDescription(transaction.description);
    setProof(transaction.proof);
    setError(null);
  };

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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await updateTransaction({
        sheetTitle,
        rowIndex: transaction.rowIndex,
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
      setEditOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteTransaction({ sheetTitle, rowIndex: transaction.rowIndex });
      setDeleteOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => {
            resetEdit();
            setEditOpen(true);
          }}
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

      <Dialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) resetEdit();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" />
              Modifier la transaction
            </DialogTitle>
            <p className="font-mono text-[10px] text-muted-foreground">
              {sheetTitle} · ligne {transaction.rowIndex}
            </p>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
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
                <PersonSelect persons={persons} value={person} onValueChange={setPerson} />
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
                  setEditOpen(false);
                  resetEdit();
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="min-w-28">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                className="min-w-28"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Supprimer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};
