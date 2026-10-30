package com.example.demo.security;

import com.example.demo.exception.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Protege /auth/login: máximo de 5 intentos por minuto y por IP.
 * Configurable con saas.login.rate-limit.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private final int maxIntentos;
    private final ConcurrentMap<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LoginRateLimitFilter(@Value("${saas.login.rate-limit:5}") int maxIntentos) {
        this.maxIntentos = maxIntentos;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !("/auth/login".equals(request.getRequestURI()) && "POST".equalsIgnoreCase(request.getMethod()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String ip = obtenerIp(request);
        Bucket bucket = buckets.computeIfAbsent(ip, k -> crearBucket());

        if (!bucket.tryConsume(1)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json;charset=UTF-8");
            objectMapper.writeValue(response.getWriter(), ApiError.of(
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    "TOO_MANY_REQUESTS",
                    "Demasiados intentos de inicio de sesión. Espere 1 minuto e intente de nuevo.",
                    request.getRequestURI()));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Bucket crearBucket() {
        Duration ventana = Duration.ofMinutes(1);
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(maxIntentos)
                        .refillGreedy(maxIntentos, ventana)
                        .build())
                .build();
    }

    /**
     * Solo para tests: reinicia los buckets de rate limiting.
     */
    public void limpiarBuckets() {
        buckets.clear();
    }

    private String obtenerIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
