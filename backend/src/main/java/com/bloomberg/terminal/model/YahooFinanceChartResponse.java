package com.bloomberg.terminal.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class YahooFinanceChartResponse {

    private Chart chart;

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Chart {
        private List<Result> result;

        @Data
        @NoArgsConstructor
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Result {
            private Meta meta;
            private List<Long> timestamp;
            private Indicators indicators;

            @Data
            @NoArgsConstructor
            @JsonIgnoreProperties(ignoreUnknown = true)
            public static class Meta {
                private double regularMarketPrice;
                private double regularMarketDayHigh;
                private double regularMarketDayLow;
                private double regularMarketOpen;
                private double chartPreviousClose;
            }

            @Data
            @NoArgsConstructor
            @JsonIgnoreProperties(ignoreUnknown = true)
            public static class Indicators {
                private List<QuoteData> quote;

                @Data
                @NoArgsConstructor
                @JsonIgnoreProperties(ignoreUnknown = true)
                public static class QuoteData {
                    private List<Double> close;
                }
            }
        }
    }
}
