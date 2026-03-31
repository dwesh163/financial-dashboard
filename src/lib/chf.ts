export function parseChf(s: string | undefined): number {
  if (!s?.trim()) return 0;
  const clean = s.replace(/Fr\.\s*/gi, "").replace(/'/g, "").trim();
  if (!clean || /^-\s*$/.test(clean)) return 0;
  const negative = clean.startsWith("-");
  const n = parseFloat(clean.replace("-", "").replace(/\s/g, ""));
  return Number.isNaN(n) ? 0 : negative ? -n : n;
}

export function formatChf(n: number): string {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
  }).format(n);
}
