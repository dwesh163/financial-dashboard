"use client";

import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MerchantOptions } from "@/lib/merchant-options";

type Props = { value: string; onValueChange: (v: string) => void; options: MerchantOptions };

export const CounterpartSelect = ({ value, onValueChange, options }: Props) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Choisir..." />
    </SelectTrigger>
    <SelectContent position="popper" className="w-full min-w-(--radix-select-trigger-width)">
      {options.merchants.map(({ key, label, value: val }) => (
        <SelectItem key={key} value={val}>{label}</SelectItem>
      ))}
      {options.merchants.length > 0 && <SelectSeparator />}
      {options.fixed.map(({ key, label, value: val }) => (
        <SelectItem key={key} value={val}>{label}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);
