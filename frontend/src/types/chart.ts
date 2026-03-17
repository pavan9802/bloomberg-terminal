export const PERIODS = [
  { label: "1D", interval: "1d",  ranges: ["1mo", "3mo", "6mo", "1y", "2y", "5y", "max"] },
  { label: "1W", interval: "1wk", ranges: ["1y", "2y", "5y", "10y", "max"] },
  { label: "1M", interval: "1mo", ranges: ["5y", "10y", "max"] },
] as const;

export type Period = typeof PERIODS[number];

export interface ChartState {
  symbol: string;
  period: Period;
  rangeIndex: number;
  loading: boolean;
  exhausted: boolean;
}
