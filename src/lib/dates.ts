export const toIsoDate = (display: string): string => {
  const [d, m, y] = display.split(".");
  return `${y ?? ""}-${m ?? ""}-${d ?? ""}`;
};

export const toDisplayDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d ?? ""}.${m ?? ""}.${y ?? ""}`;
};

export const todayIso = (): string => new Date().toISOString().split("T")[0] ?? "";
