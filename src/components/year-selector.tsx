"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setYearCookie } from "@/app/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  years: number[];
  selectedYear: number;
};

export function YearSelector({ years, selectedYear }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={String(selectedYear)}
      disabled={isPending}
      onValueChange={(value) => {
        const year = parseInt(value, 10);
        startTransition(async () => {
          await setYearCookie(year);
          router.refresh();
        });
      }}
    >
      <SelectTrigger className="w-full font-mono text-xs h-8">
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
  );
}
