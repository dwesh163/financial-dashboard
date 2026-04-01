import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { TypeOption } from "@/types/props";

export const BANK_ACCOUNT = "Compte bancaire";
export const TRANSACTION_TYPE_OPTIONS: TypeOption[] = [
  { value: "in", label: "Entrée", icon: ArrowDownLeft, color: "text-primary", bg: "bg-primary/10" },
  { value: "out", label: "Sortie", icon: ArrowUpRight, color: "text-destructive", bg: "bg-destructive/10" },
];

export const TRANSACTION_HEADERS = [
  "Date",
  "Sortie",
  "Entrée",
  "Source",
  "Destination",
  "Exécutant",
  "Marchant",
  "Description",
  "Pièce",
] as const;
