package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final LoginRateLimitFilter loginRateLimitFilter;
    private final RequestLoggingFilter requestLoggingFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          LoginRateLimitFilter loginRateLimitFilter,
                          RequestLoggingFilter requestLoggingFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.loginRateLimitFilter = loginRateLimitFilter;
        this.requestLoggingFilter = requestLoggingFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> {})

            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/", "/index.html", "/favicon.ico").permitAll()
                .requestMatchers("/styles.css", "/app.js", "/base.css", "/footer.js",
                        "/client.css", "/client.js", "/tienda.css", "/tienda.js",
                        "/whatsapp-float.css", "/whatsapp-float.js").permitAll()
                .requestMatchers("/inicio.html", "/tienda.html", "/productos.html",
                        "/nosotros.html", "/contactanos.html").permitAll()
                .requestMatchers("/html/**", "/js/**", "/css/**", "/images/**").permitAll()
                .requestMatchers("/api/tienda/**").permitAll()
                .requestMatchers("/api/contenido/**").permitAll()
                .requestMatchers("/api/categorias/activas").permitAll()
                .requestMatchers("/api/pagos/webhook", "/api/pagos/webhook/mercadopago").permitAll()
                .requestMatchers("/api/pagos/retorno").permitAll()
                .requestMatchers("/api/pagos/paypal/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .anyRequest().authenticated()
            )

            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
            )

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(loginRateLimitFilter, JwtAuthenticationFilter.class)
            .addFilterBefore(requestLoggingFilter, LoginRateLimitFilter.class);

        return http.build();
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.fromHierarchy("""
            ROLE_SUPREMO > ROLE_ADMINISTRADOR
            ROLE_ADMINISTRADOR > ROLE_VENDEDOR
        """);
    }

    @Bean
    public DefaultMethodSecurityExpressionHandler methodSecurityExpressionHandler(RoleHierarchy roleHierarchy) {
        DefaultMethodSecurityExpressionHandler handler = new DefaultMethodSecurityExpressionHandler();
        handler.setRoleHierarchy(roleHierarchy);
        return handler;
    }
}
