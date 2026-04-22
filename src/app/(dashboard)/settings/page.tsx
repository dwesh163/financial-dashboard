"use client";

import "@aejkatappaja/phantom-ui";
import "@aejkatappaja/phantom-ui/ssr.css";
import { ChevronRight, Lock, LogOut, UserRound } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";
import { PinDigits } from "@/components/lock/digits";
import { YearSelector } from "@/components/navigation/year";
import { cn } from "@/lib/utils";
import { removePin, setPin } from "@/services/pin";
import { getSettingsData } from "@/services/settings";
import type { SettingsData } from "@/types/settings";

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [pinActive, setPinActive] = useState(false);
  const [stage, setStage] = useState<"idle" | "entering" | "confirming">("idle");
  const [firstPin, setFirstPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isPinPending, startPinTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    getSettingsData().then((d) => {
      setData(d);
      setPinActive(d.isPinSet);
    });
  }, []);

  const handleFirstComplete = (pin: string) => {
    setFirstPin(pin);
    setStage("confirming");
  };

  const handleConfirmComplete = (pin: string) => {
    if (pin !== firstPin) {
      setPinError("Les codes ne correspondent pas");
      setStage("entering");
      setFirstPin("");
      return;
    }
    startPinTransition(async () => {
      const result = await setPin({ pin });
      if (result.success) {
        setPinActive(true);
        setStage("idle");
        setPinError("");
        router.refresh();
      } else {
        setPinError(result.error);
        setStage("entering");
        setFirstPin("");
      }
    });
  };

  const handleRemovePin = () => {
    startPinTransition(async () => {
      await removePin();
      setPinActive(false);
      router.refresh();
    });
  };

  const resetPin = () => {
    setStage("idle");
    setPinError("");
    setFirstPin("");
  };

  const phantomProps = { loading: true, animation: "pulse" as const, "fallback-radius": 4 };

  if (!data)
    return (
      <div className="max-w-lg flex flex-col gap-6">
        <phantom-ui {...phantomProps}>
          <div className="mb-2 space-y-2">
            <div className="h-2 w-16 rounded" />
            <div className="h-7 w-32 rounded" />
          </div>
        </phantom-ui>
        <phantom-ui {...phantomProps}>
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-border">
            <div className="w-14 h-14 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-36 rounded" />
              <div className="h-2 w-16 rounded" />
            </div>
          </div>
        </phantom-ui>
        <div className="space-y-3">
          <phantom-ui {...phantomProps}>
            <div className="h-2 w-12 rounded mx-1" />
          </phantom-ui>
          <phantom-ui {...phantomProps}>
            <div className="rounded-2xl border border-border px-4 py-3.5 flex items-center justify-between">
              <div className="h-3 w-24 rounded" />
              <div className="h-7 w-28 rounded" />
            </div>
          </phantom-ui>
          <phantom-ui {...phantomProps}>
            <div className="rounded-2xl border border-border px-4 py-3.5 flex items-center gap-3">
              <div className="w-4 h-4 rounded" />
              <div className="h-3 w-28 rounded" />
            </div>
          </phantom-ui>
        </div>
        <div className="space-y-3">
          <phantom-ui {...phantomProps}>
            <div className="h-2 w-14 rounded mx-1" />
          </phantom-ui>
          <phantom-ui {...phantomProps}>
            <div className="rounded-2xl border border-border px-4 py-4 flex items-center gap-3">
              <div className="w-4 h-4 rounded" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded" />
                <div className="h-2 w-20 rounded" />
              </div>
            </div>
          </phantom-ui>
        </div>
      </div>
    );

  const profileCard = (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center">
        {data.userImage ? (
          <Image src={data.userImage} alt="Avatar" width={56} height={56} className="object-cover" />
        ) : (
          <UserRound className="w-7 h-7 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-base font-bold text-foreground truncate">{data.userName}</p>
        <p className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] mt-0.5">
          v{data.version}
        </p>
      </div>
    </div>
  );

  const compteRows = (
    <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
      <div className="flex items-center justify-between px-4 py-3.5">
        <p className="font-mono text-sm text-foreground">Année active</p>
        <div className="w-36">
          <YearSelector years={data.years} selectedYear={data.selectedYear} />
        </div>
      </div>
    </div>
  );

  const signOutRow = (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center justify-between px-4 py-3.5 active:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <LogOut className="w-4 h-4 text-destructive" />
          <p className="font-mono text-sm text-destructive">Se déconnecter</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
      </button>
    </div>
  );

  const securiteRow = (
    <div className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Lock className={cn("w-4 h-4", pinActive ? "text-primary" : "text-muted-foreground")} />
          <div>
            <p className="font-mono text-sm text-foreground">Verrouillage auto</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
              {pinActive ? `Actif · ${Math.floor(data.inactivityThresholdMs / 60000)} min` : "Désactivé"}
            </p>
          </div>
        </div>
        {pinActive ? (
          <button
            type="button"
            onClick={handleRemovePin}
            disabled={isPinPending}
            className="font-mono text-xs text-destructive disabled:opacity-50"
          >
            Désactiver
          </button>
        ) : (
          <button type="button" onClick={() => setStage("entering")} className="font-mono text-xs text-primary">
            Activer
          </button>
        )}
      </div>
    </div>
  );

  const pinSetupCard = (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-5">
      <div>
        <p className="font-mono text-sm text-foreground">
          {stage === "entering" ? "Nouveau code" : "Confirmer le code"}
        </p>
        <p className="font-mono text-xs text-muted-foreground mt-0.5">
          {stage === "entering" ? "Choisissez un code à 6 chiffres" : "Saisissez le même code"}
        </p>
      </div>
      <PinDigits
        key={stage + pinError}
        onComplete={stage === "entering" ? handleFirstComplete : handleConfirmComplete}
        error={pinError}
        disabled={isPinPending}
        autoFocus
      />
      {pinError && <p className="font-mono text-xs text-destructive">{pinError}</p>}
      <button type="button" onClick={resetPin} className="font-mono text-xs text-muted-foreground/50">
        Annuler
      </button>
    </div>
  );

  return (
    <div className="dark max-w-lg flex flex-col gap-6">
      <div className="mb-2">
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-1">Système</p>
        <p className="font-mono text-2xl font-bold text-foreground">Paramètres</p>
      </div>

      {profileCard}

      <section className="space-y-3">
        <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 font-semibold px-1">Compte</p>
        {compteRows}
        {signOutRow}
      </section>

      <section className="space-y-3">
        <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 font-semibold px-1">Sécurité</p>
        {stage === "idle" ? securiteRow : pinSetupCard}
      </section>
    </div>
  );
}
