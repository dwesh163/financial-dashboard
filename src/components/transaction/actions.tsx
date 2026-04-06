"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { TransactionForm } from "@/components/transaction/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { toIsoDate } from "@/lib/dates";
import { deleteTransaction, updateTransaction } from "@/services/transactions";
import type { TransactionActionsProps } from "@/types/props";
import type { NewTransaction } from "@/types/transaction";

export const TransactionActions = ({ transaction, sheetTitle, persons, merchants }: TransactionActionsProps) => {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialType = transaction.in && transaction.in > 0 ? ("in" as const) : ("out" as const);
  const initialCounterpart = initialType === "out" ? transaction.destination : transaction.source;

  const handleUpdate = async (tx: NewTransaction) => {
    await updateTransaction({ sheetTitle, rowIndex: transaction.rowIndex, tx });
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    router.refresh();
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
          onClick={() => setEditOpen(true)}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
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
          <TransactionForm
            sheetTitle={sheetTitle}
            persons={persons}
            merchants={merchants}
            initial={{
              type: initialType,
              date: toIsoDate(transaction.date),
              amount: String(transaction.in ?? transaction.out ?? ""),
              counterpart: initialCounterpart,
              person: transaction.person,
              description: transaction.description,
              proof: transaction.proof,
            }}
            onSubmit={handleUpdate}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditOpen(false)}
            submitLabel="Enregistrer"
          />
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
              <p className="text-foreground">{transaction.description || transaction.destination || "—"}</p>
              <p className="text-muted-foreground text-xs">{transaction.date}</p>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Cette action supprime définitivement la ligne {transaction.rowIndex} du classeur.
            </p>
            {error && <FormError message={error} />}
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
