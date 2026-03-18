package com.bloomberg.terminal.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.bloomberg.terminal.client.YahooFinanceClient;
import com.bloomberg.terminal.config.CacheConfig;
import com.bloomberg.terminal.model.PriceBar;
import com.bloomberg.terminal.model.StockSnapshot;
import com.bloomberg.terminal.model.YahooFinanceChartResponse.Chart.Result;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketDataService {

    private final YahooFinanceClient yahooFinanceClient;
    private static final ZoneId NY = ZoneId.of("America/New_York");

    @Cacheable(value = CacheConfig.CACHE_SEARCH, key = "#query.toUpperCase()", unless = "#result == null")
    public Set<String> searchSymbols(String query) {
        log.debug("Cache MISS - searching symbols for query: {}", query);
        return yahooFinanceClient.searchSymbols(query)
                .map(response -> {
                    if (response.getQuotes() == null) {
                        log.warn("Symbol search for '{}': no quotes in response", query);
                        return Set.<String>of();
                    }
                    Set<String> results = response.getQuotes().stream()
                            .map(q -> q.getSymbol())
                            .collect(Collectors.toSet());
                    log.info("Symbol search for '{}' returned {} results", query, results.size());
                    return results;
                })
                .orElse(Set.of());
    }

    @Cacheable(value = CacheConfig.CACHE_PRICE, key = "#symbol.toUpperCase()", unless = "#result == null")
    public StockSnapshot getPrice(String symbol) {
        log.debug("Cache MISS - fetching price for symbol: {}", symbol);
        return yahooFinanceClient.getChart(symbol)
                .map(response -> {
                    Result result = firstResult(response, symbol);
                    if (result == null) return null;
                    Result.Meta meta = result.getMeta();
                    double price = meta.getRegularMarketPrice();
                    double prevClose = meta.getChartPreviousClose();
                    double change = price - prevClose;
                    double percentChange = prevClose != 0 ? (change / prevClose) * 100 : 0;
                    StockSnapshot snapshot = StockSnapshot.builder()
                            .price(bd(price))
                            .open(bd(meta.getRegularMarketOpen()))
                            .high(bd(meta.getRegularMarketDayHigh()))
                            .low(bd(meta.getRegularMarketDayLow()))
                            .previousClose(bd(prevClose))
                            .change(bd(change))
                            .percentChange(bd(percentChange))
                            .build();
                    log.info("Price for {}: {}", symbol, snapshot.getPrice());
                    return snapshot;
                })
                .orElse(null);
    }

    @Cacheable(value = CacheConfig.CACHE_HISTORY,
               key = "T(String).format('%s-%s-%s', #symbol.toUpperCase(), #interval, #range)",
               unless = "#result == null")
    public List<PriceBar> getHistory(String symbol, String interval, String range) {
        log.debug("Cache MISS - fetching price history for symbol: {}", symbol);
        return yahooFinanceClient.getHistory(symbol, interval, range)
                .map(response -> {
                    Result result = firstResult(response, symbol);
                    if (result == null) return List.<PriceBar>of();
                    if (result.getTimestamp() == null || result.getIndicators() == null
                            || result.getIndicators().getQuote() == null
                            || result.getIndicators().getQuote().isEmpty()) {
                        log.warn("History for '{}': missing timestamps or quote data", symbol);
                        return List.<PriceBar>of();
                    }
                    List<Long> timestamps = result.getTimestamp();
                    List<Double> closes = result.getIndicators().getQuote().get(0).getClose();
                    List<PriceBar> history = new ArrayList<>();
                    for (int i = 0; i < timestamps.size() && i < closes.size(); i++) {
                        Double close = closes.get(i);
                        if (close == null) continue;
                        String date = Instant.ofEpochSecond(timestamps.get(i))
                                .atZone(NY).toLocalDate().toString();
                        history.add(PriceBar.builder()
                                .date(date)
                                .price(BigDecimal.valueOf(close).setScale(2, RoundingMode.HALF_UP))
                                .build());
                    }
                    log.info("Fetched {} price bars for {}", history.size(), symbol);
                    return history;
                })
                .orElse(List.of());
    }

    private Result firstResult(com.bloomberg.terminal.model.YahooFinanceChartResponse response, String symbol) {
        if (response.getChart() == null || response.getChart().getResult() == null
                || response.getChart().getResult().isEmpty()) {
            log.warn("No chart result for '{}'", symbol);
            return null;
        }
        return response.getChart().getResult().get(0);
    }

    private BigDecimal bd(double value) {
        return BigDecimal.valueOf(value);
    }
}
