const BASE = "http://localhost:8080/api/market";

export type StockSnapshot = {
  price: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
};

export type PriceBar = { date: string; price: number };

export const marketApi = {
  getPrice: (symbol: string): Promise<number> =>
    fetch(`${BASE}/price/${symbol}`)
      .then(res => res.json())
      .then((data: StockSnapshot) => data.price || data.previousClose),

  getHistory: (symbol: string, interval = "1d", range = "1mo"): Promise<PriceBar[]> =>
    fetch(`${BASE}/history/${symbol}?interval=${interval}&range=${range}`).then(res => res.json()),

  searchSymbols: (query: string): Promise<string[]> =>
    fetch(`${BASE}/search/${query}`).then(res => res.json()),
};
