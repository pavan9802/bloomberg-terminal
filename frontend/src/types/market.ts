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
