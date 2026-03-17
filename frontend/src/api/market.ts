import { StockSnapshot, PriceBar } from "../types/market";

export type { StockSnapshot, PriceBar };

const BASE = "http://localhost:8080/api/market";

export const marketApi = {
  getPrice: (symbol: string): Promise<number> =>
    fetch(`${BASE}/price/${symbol}`)
      .then(res => res.json())
      .then((data: StockSnapshot) => data.price || data.previousClose),

  getHistory: (symbol: string, interval = "1d", range = "1mo", signal?: AbortSignal): Promise<PriceBar[]> =>
    fetch(`${BASE}/history/${symbol}?interval=${interval}&range=${range}`, { signal }).then(res => res.json()),

  searchSymbols: (query: string): Promise<string[]> =>
    fetch(`${BASE}/search/${query}`).then(res => res.json()),
};
