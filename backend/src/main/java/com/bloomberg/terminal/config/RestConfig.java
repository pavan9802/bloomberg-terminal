package com.bloomberg.terminal.config;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestConfig {

    @Bean
    public RestTemplate yahooFinanceRestTemplate(RestTemplateBuilder builder) {
        return builder
                .rootUri("https://query1.finance.yahoo.com")
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .additionalInterceptors((request, body, execution) -> {
                    request.getHeaders().set("User-Agent", "Mozilla/5.0");
                    return execution.execute(request, body);
                })
                .build();
    }
}
