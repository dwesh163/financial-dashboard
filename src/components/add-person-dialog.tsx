"use client";

import { Loader2, Plus, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addPerson } from "@/services/contacts";
import type { ContactType } from "@/types/contact";

export const AddPersonDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [iban, setIban] = useState("");
  const [type, setType] = useState<ContactType | "">("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setIban("");
    setType("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addPerson({ name, iban: iban.trim() || undefined, type: type || undefined });
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2 font-mono text-xs">
        <Plus className="w-3.5 h-3.5" />
        Ajouter
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserRound className="w-4 h-4 text-primary" />
              Nouvelle personne
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Nom</p>
              <Input
                placeholder="Prénom Nom..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">IBAN</p>
              <Input placeholder="FR76..." value={iban} onChange={(e) => setIban(e.target.value)} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Scope</p>
              <Select value={type} onValueChange={(v) => setType(v as ContactType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Interne / Externe..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Interne">Interne</SelectItem>
                  <SelectItem value="Externe">Externe</SelectItem>
                </SelectContent>
              </Select>
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
                  reset();
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading || !name.trim()} className="min-w-24">
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
