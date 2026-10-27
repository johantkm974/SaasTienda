package com.example.demo.dto;

import java.math.BigDecimal;

public record EnvioUpdateRequest(
        String direccionEntrega,
        String distrito,
        BigDecimal costoEnvio,
        String transportista,
        String guiaTracking) {
}