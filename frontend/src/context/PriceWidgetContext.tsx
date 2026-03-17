import { createContext, useContext, useEffect, useState } from "react";
import { marketApi } from "../api/market";

const WATCHLIST = ["AAPL", "GOOGL"];

interface PriceWidgetContextValue {
  watchlist: string[];
  prices: Record<string, number>;
  selected: string;
  setSelected: (symbol: string) => void;
  setWatchlist: (list: string[]) => void;
  addSymbol: (symbol: string) => void;
}

const PriceWidgetContext = createContext<PriceWidgetContextValue | null>(null);

export function PriceWidgetProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState(WATCHLIST);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState("AAPL");

  useEffect(() => {
    watchlist.forEach((symbol) => {
      marketApi.getPrice(symbol).then(price =>
        setPrices(prev => ({ ...prev, [symbol]: price }))
      );
    });
  }, []);

  const addSymbol = (symbol: string) => {
    if (watchlist.includes(symbol)) return;
    marketApi.getPrice(symbol)
      .then(price => {
        setWatchlist(prev => [...prev, symbol]);
        setPrices(prev => ({ ...prev, [symbol]: price }));
        setSelected(symbol);
      })
      .catch(err => console.error(`Failed to fetch price for ${symbol}:`, err));
  };

  return (
    <PriceWidgetContext.Provider value={{ watchlist, prices, selected, setSelected, setWatchlist, addSymbol }}>
      {children}
    </PriceWidgetContext.Provider>
  );
}

export function usePriceWidget() {
  const ctx = useContext(PriceWidgetContext);
  if (!ctx) throw new Error("usePriceWidget must be used within a PriceWidgetProvider");
  return ctx;
}


