"use client";

import { FileText, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { TransactionForm } from "@/components/transaction/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createTransaction } from "@/services/transactions";
import type { AddTransactionDialogProps } from "@/types/props";
import type { NewTransaction } from "@/types/transaction";

export const AddTransactionDialog = ({ sheetTitle, persons, merchants }: AddTransactionDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (tx: NewTransaction) => {
    await createTransaction({ sheetTitle, tx });
  };

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Fragment>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2 h-8 font-mono text-xs">
        <Plus className="w-3.5 h-3.5" />
        Ajouter
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Nouvelle transaction
            </DialogTitle>
            <p className="font-mono text-[10px] text-muted-foreground">{sheetTitle}</p>
          </DialogHeader>
          <TransactionForm
            sheetTitle={sheetTitle}
            persons={persons}
            merchants={merchants}
            onSubmit={handleSubmit}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
            submitLabel="Ajouter"
          />
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};
