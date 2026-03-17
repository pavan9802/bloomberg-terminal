package com.bloomberg.terminal.client;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.bloomberg.terminal.model.YahooFinanceChartResponse;
import com.bloomberg.terminal.model.YahooFinanceSearchResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class YahooFinanceClient {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public YahooFinanceClient(@Qualifier("yahooFinanceRestTemplate") RestTemplate restTemplate,
                              ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public Optional<YahooFinanceChartResponse> getChart(String symbol) {
        return fetch("chart", YahooFinanceChartResponse.class,
                "/v8/finance/chart/{symbol}", symbol);
    }

    public Optional<YahooFinanceChartResponse> getHistory(String symbol, String interval, String range) {
        return fetch("history", YahooFinanceChartResponse.class,
                "/v8/finance/chart/{symbol}?interval={interval}&range={range}", symbol, interval, range);
    }

    public Optional<YahooFinanceSearchResponse> searchSymbols(String query) {
        return fetch("search", YahooFinanceSearchResponse.class,
                "/v1/finance/search?q={query}", query);
    }

    private <T> Optional<T> fetch(String description, Class<T> type, String url, Object... vars) {
        try {
            JsonNode raw = restTemplate.getForObject(url, JsonNode.class, vars);
            if (raw == null) {
                log.warn("Null response from Yahoo Finance for {}", description);
                return Optional.empty();
            }
            logApiErrors(raw, description);
            return Optional.of(objectMapper.treeToValue(raw, type));
        } catch (RestClientException | JsonProcessingException e) {
            log.error("Failed to fetch/parse {} — {}: {}", description, e.getClass().getSimpleName(), e.getMessage(), e);
            return Optional.empty();
        }
    }

    private void logApiErrors(JsonNode raw, String description) {
        JsonNode error = raw.path("chart").path("error");
        if (!error.isMissingNode() && !error.isNull()) {
            log.error("Yahoo Finance error for {}: {}", description, error.asText());
        }
    }
}
