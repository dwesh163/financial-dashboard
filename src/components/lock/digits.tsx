"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { PinDigitsProps } from "@/types/props";

const PIN_POSITIONS = [0, 1, 2, 3, 4, 5] as const;

export const PinDigits = ({ onComplete, error, disabled = false, autoFocus = false }: PinDigitsProps) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) inputRefs.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = digits.map((d, i) => (i === index ? value : d));
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (value && next.every((d) => d !== "")) onComplete(next.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      setDigits(digits.map((d, i) => (i === index - 1 ? "" : d)));
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array.from({ length: 6 }, (_, i) => text[i] ?? "");
    setDigits(next);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) onComplete(text);
  };

  return (
    <div className="flex gap-3" onPaste={handlePaste}>
      {PIN_POSITIONS.map((i) => (
        <input
          key={`pin-${i}`}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="password"
          inputMode="numeric"
          pattern="\d"
          maxLength={1}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore
          data-protonpass-ignore="true"
          value={digits[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center font-mono text-xl font-bold bg-card border rounded text-foreground",
            "focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors",
            error ? "border-destructive" : "border-border",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        />
      ))}
    </div>
  );
};
