"use client";

import { FileText, X } from "lucide-react";
import { useState } from "react";
import { ProofUpload } from "@/components/proof-upload";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function isDriveUrl(v: string) {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

export function ProofField({ value, onChange, placeholder = "N° de pièce..." }: Props) {
  // When loading an existing URL (edit mode) we show a generic label
  const [driveLabel, setDriveLabel] = useState<string | null>(() => (isDriveUrl(value) ? "Fichier PDF" : null));

  function handleUploaded({ name, webViewLink }: { name: string; webViewLink: string }) {
    setDriveLabel(name);
    onChange(webViewLink);
  }

  function handleClear() {
    setDriveLabel(null);
    onChange("");
  }

  if (isDriveUrl(value) && driveLabel !== null) {
    return (
      <div className="flex items-center gap-2 h-9 px-3 border border-primary/30 bg-primary/5 min-w-0">
        <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-primary flex-1 truncate hover:underline"
        >
          {driveLabel}
        </a>
        <button
          type="button"
          onClick={handleClear}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setDriveLabel(null);
          onChange(e.target.value);
        }}
      />
      <ProofUpload onUploaded={handleUploaded} />
    </div>
  );
}
