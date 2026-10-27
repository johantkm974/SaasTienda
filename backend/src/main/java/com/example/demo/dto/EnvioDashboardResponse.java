package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EnvioDashboardResponse(
        Integer id,
        Integer ventaId,
        String nombreComercial,
        String clienteNombre,
        String clienteTelefono,
        String direccionEntrega,
        String distrito,
        BigDecimal costoEnvio,
        BigDecimal totalVenta,
        String metodoPago,
        String estadoVenta,
        String estadoPago,
        String estadoEnvio,
        String transportista,
        String guiaTracking,
        LocalDateTime fechaVenta,
        LocalDateTime fechaDespacho,
        LocalDateTime fechaEntrega) {
}