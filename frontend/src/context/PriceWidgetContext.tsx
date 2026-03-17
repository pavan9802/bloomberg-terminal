import { createContext, useContext, useEffect, useState } from "react";
import { marketApi } from "../api/market";
import { PriceWidgetContextValue } from "../types/context";

const WATCHLIST = ["AAPL", "GOOGL"];

const PriceWidgetContext = createContext<PriceWidgetContextValue | null>(null);

export function PriceWidgetProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState(WATCHLIST);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState("AAPL");

  useEffect(() => {
    const fetchAll = () =>
      Promise.all(watchlist.map(symbol =>
        marketApi.getPrice(symbol).then(price => ({ symbol, price }))
      )).then(results => {
        setPrices(prev => {
          const next = { ...prev };
          results.forEach(({ symbol, price }) => { next[symbol] = price; });
          return next;
        });
      });
    fetchAll();
    const id = setInterval(fetchAll, 30000);
    return () => clearInterval(id);
  }, [watchlist]);

  const addSymbol = (symbol: string): Promise<void> => {
    if (watchlist.includes(symbol)) return Promise.resolve();
    return marketApi.getPrice(symbol)
      .then(price => {
        setWatchlist(prev => [...prev, symbol]);
        setPrices(prev => ({ ...prev, [symbol]: price }));
        setSelected(symbol);
      });
  };

  useEffect(() => {
    setSelected(prev => watchlist.includes(prev) ? prev : (watchlist[0] ?? ""));
  }, [watchlist]);

  const removeSymbol = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
    setPrices(({ [symbol]: _, ...rest }) => rest);
  };

  return (
    <PriceWidgetContext.Provider value={{ watchlist, prices, selected, setSelected, addSymbol, removeSymbol }}>
      {children}
    </PriceWidgetContext.Provider>
  );
}

export function usePriceWidget() {
  const ctx = useContext(PriceWidgetContext);
  if (!ctx) throw new Error("usePriceWidget must be used within a PriceWidgetProvider");
  return ctx;
}


