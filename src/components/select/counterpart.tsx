"use client";

import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CounterpartSelectProps } from "@/types/props";

export const CounterpartSelect = ({ value, onValueChange, options }: CounterpartSelectProps) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className="w-full h-9!">
      <SelectValue placeholder="Choisir..." />
    </SelectTrigger>
    <SelectContent position="popper" className="w-full min-w-(--radix-select-trigger-width)">
      {options.merchants.map(({ key, label, value: val }) => (
        <SelectItem key={key} value={val}>
          {label}
        </SelectItem>
      ))}
      {options.merchants.length > 0 && <SelectSeparator />}
      {options.fixed.map(({ key, label, value: val }) => (
        <SelectItem key={key} value={val}>
          {label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
