import type { FormErrorProps } from "@/types/props";

export const FormError = ({ message }: FormErrorProps) => (
  <p className="font-mono text-xs text-destructive border border-destructive/30 px-3 py-2">{message}</p>
);
