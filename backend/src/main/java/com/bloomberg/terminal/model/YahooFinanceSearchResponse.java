package com.bloomberg.terminal.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class YahooFinanceSearchResponse {

    private List<QuoteResult> quotes;

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class QuoteResult {
        private String symbol;
        private String longname;
        private String shortname;
        private String quoteType;
    }
}
