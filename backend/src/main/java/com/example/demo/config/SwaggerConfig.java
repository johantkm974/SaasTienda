package com.example.demo.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String BEARER = "bearerAuth";

    @Bean
    public OpenAPI saasOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SaaS BodegaControl API")
                        .description("""
                                API REST del SaaS multi-tenant de inventario y ventas.
                                Roles: SUPREMO (plataforma), ADMINISTRADOR y VENDEDOR (por empresa).
                                Autenticación: Bearer JWT obtenido en POST /auth/login.
                                """)
                        .version("1.0.0")
                        .contact(new Contact().name("SaaS BodegaControl")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER))
                .components(new Components().addSecuritySchemes(BEARER,
                        new SecurityScheme()
                                .name(BEARER)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
