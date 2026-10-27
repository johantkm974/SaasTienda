package com.example.demo.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TiendaCheckoutRequest {
    private Integer clienteId;
    private String nombres;
    private String apellidos;
    private String correo;
    private String telefono;
    private String direccion;
    private String distrito;
    private BigDecimal costoEnvio;
    private boolean conPago;
    // MERCADO_PAGO | PAYPAL | CONTADO
    private String metodoPago;
    private List<TiendaCheckoutItemRequest> items;
}
