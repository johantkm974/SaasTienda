package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TiendaCheckoutResponse {
    private Integer ventaId;
    private BigDecimal total;
    private BigDecimal costoEnvio;
    private String estadoPago;
    private String estadoVenta;
    private String initPoint;
    private String paypalUrl;
    private String metodoPago;
    private boolean conPago;
}
