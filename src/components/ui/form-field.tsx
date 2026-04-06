import type { FormFieldProps } from "@/types/props";

export const FormField = ({ label, children }: FormFieldProps) => (
  <div>
    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{label}</p>
    {children}
  </div>
);
