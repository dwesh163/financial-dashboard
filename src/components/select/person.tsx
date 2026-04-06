"use client";

import { User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PersonSelectProps } from "@/types/props";

const NONE = "__none__";

export const PersonSelect = ({ persons, value, onValueChange, placeholder = "Sélectionner..." }: PersonSelectProps) => {
  const handleChange = (v: string) => onValueChange(v === NONE ? "" : v);

  return (
    <Select value={value || NONE} onValueChange={handleChange}>
      <SelectTrigger className="w-full h-9">
        <div className="flex items-center gap-2 min-w-0">
          <User className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>
          <span className="text-muted-foreground">— Aucune —</span>
        </SelectItem>
        {persons.map((p) => (
          <SelectItem key={p.name} value={p.name}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
