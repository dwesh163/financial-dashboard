"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ProofField } from "@/components/proof/field";
import { CounterpartSelect } from "@/components/select/counterpart";
import { PersonSelect } from "@/components/select/person";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { BANK_ACCOUNT, TRANSACTION_TYPE_OPTIONS as TYPE_OPTIONS } from "@/constants/transactions";
import { toDisplayDate, todayIso } from "@/lib/dates";
import { buildMerchantOptions } from "@/lib/merchant-options";
import { cn } from "@/lib/utils";
import type { TransactionFormProps } from "@/types/props";
import type { TransactionType } from "@/types/transaction";

export const TransactionForm = ({
  sheetTitle: _sheetTitle,
  persons,
  merchants,
  initial,
  onSubmit,
  onSuccess,
  onCancel,
  submitLabel,
}: TransactionFormProps) => {
  const [type, setType] = useState<TransactionType>(initial?.type ?? "out");
  const [date, setDate] = useState(initial?.date ?? todayIso());
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [counterpart, setCounterpart] = useState(initial?.counterpart ?? "");
  const [person, setPerson] = useState(initial?.person ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [proof, setProof] = useState(initial?.proof ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const source = type === "out" ? BANK_ACCOUNT : counterpart;
  const destination = type === "out" ? counterpart : BANK_ACCOUNT;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCounterpart("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        date: toDisplayDate(date),
        type,
        amount: parseFloat(amount),
        source,
        destination,
        person,
        description,
        proof,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const counterpartOptions = buildMerchantOptions(merchants);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Type">
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
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </FormField>
        <FormField label="Montant (CHF)">
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Source">
          {type === "out" ? (
            <div className="h-9 px-3 border border-border flex items-center font-mono text-xs text-muted-foreground bg-muted/30">
              {BANK_ACCOUNT}
            </div>
          ) : (
            <CounterpartSelect value={counterpart} onValueChange={setCounterpart} options={counterpartOptions} />
          )}
        </FormField>
        <FormField label="Destination">
          {type === "in" ? (
            <div className="h-9 px-3 border border-border flex items-center font-mono text-xs text-muted-foreground bg-muted/30">
              {BANK_ACCOUNT}
            </div>
          ) : (
            <CounterpartSelect value={counterpart} onValueChange={setCounterpart} options={counterpartOptions} />
          )}
        </FormField>
      </div>

      {persons.length > 0 && (
        <FormField label="Exécutant">
          <PersonSelect persons={persons} value={person} onValueChange={setPerson} />
        </FormField>
      )}

      <FormField label="Description">
        <Input placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>

      <FormField label="Pièce justificative">
        <ProofField value={proof} onChange={setProof} />
      </FormField>

      {error && <FormError message={error} />}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading} className="min-w-24">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
};
