"use client";

import { Fragment } from "react";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createYear, setYear } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { YearSelectorProps } from "@/types/props";

export const YearSelector = ({ years, selectedYear }: YearSelectorProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState(String(new Date().getFullYear() + 1));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(input, 10);
    if (years.includes(year)) {
      setError("Cette année existe déjà.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createYear(year);
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="flex items-center gap-1.5">
        <Select
          value={String(selectedYear)}
          disabled={isPending}
          onValueChange={(value) => {
            const year = parseInt(value, 10);
            startTransition(async () => {
              await setYear(year);
              router.refresh();
            });
          }}
        >
          <SelectTrigger className="flex-1 font-mono text-xs h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)} className="font-mono text-xs">
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className="flex-shrink-0 h-8 w-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
          title="Nouvelle année"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Nouvelle année
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Année</p>
              <Input
                type="number"
                min="2000"
                max="2100"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setError(null);
                }}
                autoFocus
                required
              />
            </div>
            {error && (
              <p className="font-mono text-xs text-destructive border border-destructive/30 px-3 py-2">{error}</p>
            )}
            <div className="flex justify-end gap-2 pt-1 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="min-w-24">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};
