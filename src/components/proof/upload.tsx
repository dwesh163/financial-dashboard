"use client";

import { CheckCircle2, Loader2, Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { uploadProof } from "@/services/drive";
import type { ProofUploadProps } from "@/types/props";

export const ProofUpload = ({ onUploaded, transactionId, transactionDescription, className }: ProofUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setUploaded(null);
    try {
      const form = new FormData();
      form.append("file", file);
      if (transactionId) form.append("transactionId", transactionId);
      if (transactionDescription) form.append("transactionDescription", transactionDescription);
      const result = await uploadProof(form);
      setUploaded(result.name);
      onUploaded(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        title="Joindre un PDF"
        className={cn(
          "flex items-center justify-center h-9 w-9 shrink-0 border transition-colors",
          uploaded
            ? "border-primary/40 text-primary"
            : "border-input text-muted-foreground hover:text-foreground hover:border-foreground/30",
          loading && "opacity-50 cursor-not-allowed",
        )}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : uploaded ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          <Paperclip className="w-3.5 h-3.5" />
        )}
      </button>
      {error && <p className="font-mono text-[10px] text-destructive">{error}</p>}
    </div>
  );
};
