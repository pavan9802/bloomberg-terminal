export interface PriceWidgetContextValue {
  watchlist: string[];
  prices: Record<string, number>;
  selected: string;
  setSelected: (symbol: string) => void;
  addSymbol: (symbol: string) => Promise<void>;
  removeSymbol: (symbol: string) => void;
}
