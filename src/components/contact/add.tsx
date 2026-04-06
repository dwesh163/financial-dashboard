"use client";

import { Building2, Loader2, type LucideIcon, Mail, Phone, Plus, User, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AddDialogProps } from "@/types/props";

const ICONS_BY_NAME: Record<string, LucideIcon> = {
  Plus,
  User,
  Mail,
  Phone,
  Building2,
  Wallet,
};

export const AddContactDialog = ({ icon, title, fields, onSubmit }: AddDialogProps) => {
  const Icon = ICONS_BY_NAME[icon] ?? Plus;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, ""])),
  );

  const set = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setValues(Object.fromEntries(fields.map((f) => [f.key, ""])));
    setError(null);
  };

  const isValid = fields.filter((f) => f.required).every((f) => !!values[f.key]?.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
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
              <Icon className="w-4 h-4 text-primary" />
              {title}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) =>
              field.type === "select" ? (
                <FormField key={field.key} label={field.label}>
                  <Select value={values[field.key] ?? ""} onValueChange={(v) => set(field.key, v)}>
                    <SelectTrigger className="w-full h-9!">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              ) : (
                <FormField key={field.key} label={field.label}>
                  <Input
                    placeholder={field.placeholder}
                    value={values[field.key] ?? ""}
                    onChange={(e) => set(field.key, e.target.value)}
                    required={field.required}
                    autoFocus={fields[0]?.key === field.key}
                  />
                </FormField>
              ),
            )}

            {error && <FormError message={error} />}

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
              <Button type="submit" disabled={loading || !isValid} className="min-w-24">
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
