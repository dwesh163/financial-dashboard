"use client";

type Props = {
  visible: boolean;
};

export const RefreshIndicator = ({ visible }: Props) => {
  if (!visible) return null;
  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-4 flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 shadow-lg"></div>
  );
};
