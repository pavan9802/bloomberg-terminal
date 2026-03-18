package com.bloomberg.terminal.config;

import java.time.Duration;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String CACHE_PRICE = "price";
    public static final String CACHE_HISTORY = "history";
    public static final String CACHE_SEARCH = "search";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.registerCustomCache(CACHE_PRICE,
            buildCache(Duration.ofSeconds(15), 500));
        cacheManager.registerCustomCache(CACHE_HISTORY,
            buildCache(Duration.ofMinutes(10), 200));
        cacheManager.registerCustomCache(CACHE_SEARCH,
            buildCache(Duration.ofHours(1), 100));
        return cacheManager;
    }

    private com.github.benmanes.caffeine.cache.Cache<Object, Object> buildCache(
            Duration ttl, int maxSize) {
        return Caffeine.newBuilder()
            .maximumSize(maxSize)
            .expireAfterWrite(ttl)
            .recordStats()
            .build();
    }
}
