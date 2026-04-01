export type SummaryEvent = {
  title: string;
  slug: string;
  subtitle: string;
  budgetIn: number;
  budgetOut: number;
  realIn: number;
  realOut: number;
  difference: number;
};

export type SummaryIndicators = {
  soldeInitial: number;
  resultatBudgete: number;
  resultatReel: number;
  etatTheorique: number;
  etatReel: number;
  fortuneTheorique: number;
  fortuneReelle: number;
  ecart: number;
  lastCheck: string;
};

export type SummaryTotals = {
  budgetIn: number;
  budgetOut: number;
  realIn: number;
  realOut: number;
  difference: number;
};
