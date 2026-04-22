"use client";

import { Delete, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { PinDigits } from "@/components/lock/digits";
import { cn } from "@/lib/utils";
import { unlockWithPin } from "@/services/pin";

const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

const LockContent = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [error, setError] = useState("");
  const [attemptKey, setAttemptKey] = useState(0);
  const [mobilePin, setMobilePin] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (pin: string) => {
    startTransition(async () => {
      const result = await unlockWithPin({ pin });
      if (result.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(result.error);
        setAttemptKey((k) => k + 1);
        setMobilePin("");
      }
    });
  };

  const handleMobileKey = (key: string) => {
    if (isPending) return;
    if (key === "del") {
      setMobilePin((p) => p.slice(0, -1));
      setError("");
      return;
    }
    if (mobilePin.length >= 6) return;
    const next = mobilePin + key;
    setMobilePin(next);
    setError("");
    if (next.length === 6) submit(next);
  };

  return (
    <main className="dark min-h-screen bg-background">
      {/* Desktop */}
      <div className="hidden md:flex min-h-screen flex-col items-center justify-center gap-16 p-6">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground/40">JCM</p>
          <p className="font-mono text-2xl font-bold text-foreground">Finance</p>
        </div>
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
          <PinDigits key={attemptKey} onComplete={submit} error={error} disabled={isPending} autoFocus />
          {error && <p className="font-mono text-xs text-destructive">{error}</p>}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden min-h-screen flex-col justify-between px-6 pt-16 pb-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground/40">JCM</p>
            <p className="font-mono text-2xl font-bold text-foreground">Finance</p>
          </div>
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50">Verrouillé</p>
              <p className="font-mono text-sm text-foreground">Entrez votre code</p>
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            {(["d0", "d1", "d2", "d3", "d4", "d5"] as const).map((id, i) => (
              <div
                key={id}
                className={cn(
                  "w-3 h-3 rounded-full border transition-all duration-150",
                  i < mobilePin.length ? "bg-foreground border-foreground" : "border-muted-foreground/40",
                  error && "border-destructive bg-destructive",
                )}
              />
            ))}
          </div>
          {error && <p className="font-mono text-xs text-destructive -mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
          {NUMPAD_KEYS.map((key) => {
            if (key === "") return <div key="empty" />;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleMobileKey(key)}
                disabled={isPending}
                className={cn(
                  "h-16 rounded-2xl font-mono text-xl font-semibold text-foreground transition-colors active:bg-muted",
                  "bg-card border border-border disabled:opacity-50",
                  key === "del" && "text-muted-foreground text-base",
                )}
              >
                {key === "del" ? <Delete className="w-5 h-5 mx-auto" /> : key}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default function LockPage() {
  return (
    <Suspense>
      <LockContent />
    </Suspense>
  );
}
