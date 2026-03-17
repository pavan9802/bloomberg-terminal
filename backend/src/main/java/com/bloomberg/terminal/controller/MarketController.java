package com.bloomberg.terminal.controller;

import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.bloomberg.terminal.model.PriceBar;
import com.bloomberg.terminal.model.StockSnapshot;
import com.bloomberg.terminal.service.MarketDataService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private static final Pattern SYMBOL_PATTERN = Pattern.compile("^[A-Z]{1,5}$");
    private static final Set<String> VALID_INTERVALS = Set.of("1d", "1wk", "1mo");
    private static final Set<String> VALID_RANGES    = Set.of("1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "max");

    private final MarketDataService marketDataService;

    private void validateSymbol(String symbol) {
        if (!SYMBOL_PATTERN.matcher(symbol).matches())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid symbol: " + symbol);
    }

    @GetMapping("/price/{symbol}")
    public StockSnapshot getPrice(@PathVariable String symbol) {
        validateSymbol(symbol);
        log.info("GET /api/market/price/{}", symbol);
        return marketDataService.getPrice(symbol);
    }

    @GetMapping("/history/{symbol}")
    public List<PriceBar> getHistory(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1d") String interval,
            @RequestParam(defaultValue = "1mo") String range) {
        validateSymbol(symbol);
        if (!VALID_INTERVALS.contains(interval))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid interval: " + interval);
        if (!VALID_RANGES.contains(range))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid range: " + range);
        log.info("GET /api/market/history/{} interval={} range={}", symbol, interval, range);
        return marketDataService.getHistory(symbol, interval, range);
    }

    @GetMapping("/search/{symbol}")
    public Set<String> searchSymbols(@PathVariable String symbol) {
        validateSymbol(symbol);
        log.info("GET /api/market/search/{}", symbol);
        return marketDataService.searchSymbols(symbol);
    }
}
