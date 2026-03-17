package com.bloomberg.terminal.controller;

import java.util.List;
import java.util.Set;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    private final MarketDataService marketDataService;

    @GetMapping("/price/{symbol}")
    public StockSnapshot getPrice(@PathVariable String symbol) {
        log.info("GET /api/market/price/{}", symbol);
        return marketDataService.getPrice(symbol);
    }

    @GetMapping("/history/{symbol}")
    public List<PriceBar> getHistory(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1d") String interval,
            @RequestParam(defaultValue = "1mo") String range) {
        log.info("GET /api/market/history/{} interval={} range={}", symbol, interval, range);
        return marketDataService.getHistory(symbol, interval, range);
    }

    @GetMapping("/search/{symbol}")
    public Set<String> searchSymbols(@PathVariable String symbol) {
        log.info("GET /api/market/search/{}", symbol);
        return marketDataService.searchSymbols(symbol);
    }
}
