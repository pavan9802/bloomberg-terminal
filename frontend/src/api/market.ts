import { StockSnapshot, PriceBar } from "../types/market";

export type { StockSnapshot, PriceBar };

// Use environment variable for production, fallback to relative URL for local/docker
// VITE_API_URL should be set to your Railway backend URL in production
// e.g., "https://bloomberg-backend-production.up.railway.app"
const API_URL = import.meta.env.VITE_API_URL || "";
const BASE = `${API_URL}/api/market`;

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
