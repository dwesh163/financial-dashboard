"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";
import { PinDigits } from "@/components/lock/digits";
import { YearSelector } from "@/components/navigation/year";
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

  if (!data) return null;

  return (
    <div className="max-w-lg space-y-10">
      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Paramètres</p>
        <p className="font-mono text-2xl font-bold text-foreground">Préférences</p>
      </div>

      <section className="space-y-1">
        <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 font-semibold mb-3">Compte</p>

        <div className="flex items-center gap-4 py-4 border-b border-border">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-muted flex items-center justify-center">
            {data.userImage ? (
              <Image src={data.userImage} alt="Avatar" width={48} height={48} className="object-cover" />
            ) : (
              <UserRound className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-mono text-sm font-bold text-foreground truncate">{data.userName}</p>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
              v{data.version}
            </span>
          </div>
        </div>

        <div className="py-4 border-b border-border space-y-2.5">
          <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50">Année active</p>
          <YearSelector years={data.years} selectedYear={data.selectedYear} />
        </div>

        <div className="py-4 border-b border-border">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="font-mono text-xs text-destructive hover:opacity-75 transition-opacity"
          >
            Se déconnecter
          </button>
        </div>
      </section>

      <section>
        <p className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground/50 font-semibold mb-3">Sécurité</p>

        {stage === "idle" && pinActive && (
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <p className="font-mono text-sm text-foreground">Verrouillage automatique</p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                Actif · {Math.floor(data.inactivityThresholdMs / 60000)} minutes d'inactivité
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemovePin}
              disabled={isPinPending}
              className="font-mono text-xs text-destructive hover:opacity-75 transition-opacity disabled:opacity-50"
            >
              Désactiver
            </button>
          </div>
        )}

        {stage === "idle" && !pinActive && (
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <p className="font-mono text-sm text-foreground">Verrouillage automatique</p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">Désactivé</p>
            </div>
            <button
              type="button"
              onClick={() => setStage("entering")}
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Activer →
            </button>
          </div>
        )}

        {stage !== "idle" && (
          <div className="py-4 border-b border-border space-y-4">
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
            <button
              type="button"
              onClick={resetPin}
              className="font-mono text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Annuler
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
