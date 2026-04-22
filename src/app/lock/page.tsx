"use client";

import { Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { PinDigits } from "@/components/lock/digits";
import { unlockWithPin } from "@/services/pin";

export default function LockPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [error, setError] = useState("");
  const [attemptKey, setAttemptKey] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleComplete = (pin: string) => {
    startTransition(async () => {
      const result = await unlockWithPin({ pin });
      if (result.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(result.error);
        setAttemptKey((k) => k + 1);
      }
    });
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50">Verrouillé</p>
            <p className="font-mono text-sm text-foreground">Entrez votre code</p>
          </div>
        </div>

        <PinDigits key={attemptKey} onComplete={handleComplete} error={error} disabled={isPending} autoFocus />

        {error && <p className="font-mono text-xs text-destructive">{error}</p>}
      </div>
    </main>
  );
}
