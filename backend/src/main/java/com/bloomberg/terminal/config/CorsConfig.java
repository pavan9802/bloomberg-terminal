package com.bloomberg.terminal.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // Allowed origins from environment variable, defaults to localhost for development
    // Set CORS_ORIGINS in Railway to your frontend URL (e.g., "https://bbg-terminal.up.railway.app")
    // Multiple origins can be comma-separated
    @Value("${cors.origins:http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "OPTIONS")
                .allowedHeaders("*");
    }
}
