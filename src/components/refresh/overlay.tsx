"use client";

import { Loader2 } from "lucide-react";

type Props = {
  visible: boolean;
};

export const RefreshOverlay = ({ visible }: Props) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-sm">
      <Loader2 className="w-10 h-10 animate-spin text-foreground" />
      <p className="font-mono text-sm text-muted-foreground mt-5">Mise à jour des données...</p>
    </div>
  );
};
