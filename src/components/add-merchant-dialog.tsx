"use client";

import { Building2, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { addCommercant } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMERCE_TYPES } from "@/constants/contacts";

export const AddMerchantDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setType("");
    setAddress("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addCommercant({ name, type, address: address.trim() || undefined });
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
              <Building2 className="w-4 h-4 text-primary" />
              Nouveau commercant
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Nom</p>
              <Input
                placeholder="Nom du commercant..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Type</p>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMERCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Adresse</p>
              <Input placeholder="123 rue de la Paix..." value={address} onChange={(e) => setAddress(e.target.value)} />
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
              <Button type="submit" disabled={loading || !name.trim() || !type} className="min-w-24">
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
