import { useEffect, useRef, useState } from "react";
import { Loader } from "@mantine/core";
import { createChart, ColorType, IChartApi, ISeriesApi, AreaSeries } from "lightweight-charts";
import { marketApi, PriceBar } from "../api/market";
import { usePriceWidget } from "../context/PriceWidgetContext";
import { PERIODS, Period, ChartState } from "../types/chart";

function applyBars(series: ISeriesApi<"Area">, bars: PriceBar[]) {
  if (bars.length === 0) return;

  // Deduplicate by date (keep last value for each date) and ensure numeric price
  const dedupedMap = new Map<string, number>();
  for (const b of bars) {
    if (b.date && b.price != null) {
      dedupedMap.set(b.date, Number(b.price));
    }
  }

  // Convert to sorted array
  const cleanBars = Array.from(dedupedMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, price]) => ({ time: date as any, value: price }));

  if (cleanBars.length === 0) return;

  const isUp = cleanBars[cleanBars.length - 1].value >= cleanBars[0].value;
  series.applyOptions({
    lineColor: isUp ? "#2dd4bf" : "#64748b",
    topColor: isUp ? "rgba(45, 212, 191, 0.2)" : "rgba(100, 116, 139, 0.2)",
    bottomColor: isUp ? "rgba(45, 212, 191, 0.01)" : "rgba(100, 116, 139, 0.01)",
  });
  series.setData(cleanBars);
}

export default function PriceChart() {
  const { selected: symbol, watchlist, prices } = usePriceWidget();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [activePeriod, setActivePeriod] = useState<Period>(PERIODS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stateRef = useRef<ChartState>({
    symbol,
    period: PERIODS[0],
    rangeIndex: 0,
    loading: false,
    exhausted: false,
  });

  // Create chart once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0a0a0a" },
        textColor: "#64748b",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      },
      grid: {
        vertLines: { color: "#1a1a1a" },
        horzLines: { color: "#1a1a1a" },
      },
      crosshair: {
        vertLine: { color: "#333" },
        horzLine: { color: "#333" },
      },
      rightPriceScale: { borderColor: "#222" },
      timeScale: { borderColor: "#222", timeVisible: true },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#2dd4bf",
      topColor: "rgba(45, 212, 191, 0.2)",
      bottomColor: "rgba(45, 212, 191, 0.01)",
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(entries => {
      if (entries[0]) chart.applyOptions({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height,
      });
    });
    ro.observe(containerRef.current);

    // Detect when the user scrolls near the left edge
    chart.timeScale().subscribeVisibleLogicalRangeChange(logicalRange => {
      const s = stateRef.current;
      if (!logicalRange || s.loading || s.exhausted) return;
      if (logicalRange.from > 10) return;

      const nextIndex = s.rangeIndex + 1;
      if (nextIndex >= s.period.ranges.length) {
        s.exhausted = true;
        return;
      }

      s.loading = true;
      s.rangeIndex = nextIndex;

      const visibleRange = chart.timeScale().getVisibleRange();

      marketApi.getHistory(s.symbol, s.period.interval, s.period.ranges[nextIndex])
        .then(bars => {
          if (!seriesRef.current || bars.length === 0) return;
          applyBars(seriesRef.current, bars);
          try {
            if (visibleRange) chart.timeScale().setVisibleRange(visibleRange);
          } catch {
            // visible range may be out of bounds after data change; ignore
          }
        })
        .finally(() => { s.loading = false; });
    });

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  // Reload when symbol or period changes
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    if (!symbol || !watchlist.includes(symbol)) {
      series.setData([]);
      return;
    }

    const controller = new AbortController();
    const s = stateRef.current;
    s.symbol = symbol;
    s.period = activePeriod;
    s.rangeIndex = 0;
    s.loading = true;
    s.exhausted = false;

    series.setData([]);
    setIsLoading(true);
    setError(null);

    marketApi.getHistory(symbol, activePeriod.interval, activePeriod.ranges[0], controller.signal)
      .then(bars => {
        if (!seriesRef.current) return;
        applyBars(seriesRef.current, bars);
        chartRef.current?.timeScale().fitContent();
      })
      .catch(err => {
        if (err.name !== "AbortError") setError(`Failed to load data for ${symbol}`);
      })
      .finally(() => { s.loading = false; setIsLoading(false); });

    return () => controller.abort();
  }, [symbol, activePeriod]);

  return (
    <div className="price-chart">
      {!symbol ? (
        <div className="price-chart-empty">
          <span>Add a symbol to your watchlist to see a chart.</span>
        </div>
      ) : (
        <div className="chart-toolbar">
          <div className="chart-symbol-info">
            <span className="chart-symbol-name">{symbol}</span>
            {prices[symbol] && (
              <span className="chart-symbol-price">${prices[symbol].toFixed(2)}</span>
            )}
          </div>
          <div className="chart-periods">
            {PERIODS.map(p => (
              <button
                key={p.label}
                className={`chart-period-btn ${activePeriod.label === p.label ? "active" : ""}`}
                onClick={() => setActivePeriod(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div ref={containerRef} className="chart-canvas" style={{ visibility: symbol ? "visible" : "hidden" }}>
        {isLoading && (
          <div className="chart-spinner">
            <Loader size={24} color="gray" />
          </div>
        )}
        {error && !isLoading && (
          <div className="chart-error">{error}</div>
        )}
      </div>
    </div>
  );
}
