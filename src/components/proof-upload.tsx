"use client";

import { useRef, useState } from "react";
import { Loader2, Paperclip, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onUploaded: (file: { name: string; webViewLink: string }) => void;
  className?: string;
}

export function ProofUpload({ onUploaded, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setUploaded(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/drive/upload", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur d'upload");
      }

      const data = await res.json();
      setUploaded(data.name);
      onUploaded({ name: data.name, webViewLink: data.webViewLink });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        title="Joindre un PDF"
        className={cn(
          "flex items-center justify-center h-9 w-9 flex-shrink-0 border transition-colors",
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
}
