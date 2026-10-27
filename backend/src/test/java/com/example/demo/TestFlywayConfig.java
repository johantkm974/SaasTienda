package com.example.demo;

import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestFlywayConfig {

    /**
     * En cada arranque de contexto de test: BD limpia + migraciones V1/V2,
     * garantizando un estado determinista para la suite.
     */
    @Bean
    @Primary
    public FlywayMigrationStrategy cleanMigrateStrategy() {
        return flyway -> {
            flyway.clean();
            flyway.migrate();
        };
    }
}
