package com.tnexam.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    /**
     * Optional: specific production Vercel domain -- set ALLOWED_ORIGIN env var on Railway.
     * Example: https://tnpsc-hub.vercel.app
     * Defaults to empty string (the https://*.vercel.app wildcard already covers all Vercel deployments).
     */
    @Value("${allowed.origin:}")
    private String allowedOrigin;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(form -> form.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        List<String> allowedOrigins = new ArrayList<>(Arrays.asList(

                // Local Development
                "http://localhost:*",
                "http://127.0.0.1:*",

                // Local Network (mobile device testing)
                "http://10.*.*.*:*",
                "http://192.168.*.*:*",

                // Vercel (Preview + Production -- covers all *.vercel.app subdomains)
                "https://*.vercel.app",

                // Railway (backend-to-backend calls if needed)
                "https://*.up.railway.app"
        ));

        // Append specific production domain if configured via ALLOWED_ORIGIN env var
        if (allowedOrigin != null && !allowedOrigin.isBlank()) {
            allowedOrigins.add(allowedOrigin);
        }

        configuration.setAllowedOriginPatterns(allowedOrigins);

        configuration.setAllowedMethods(Arrays.asList(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        // Allow common request headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With",
                "Cache-Control"
        ));

        // Expose response headers that the frontend may need
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Disposition",
                "Content-Type"
        ));

        // Allow cookies/credentials if needed
        configuration.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}