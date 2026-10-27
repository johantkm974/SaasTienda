package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TiendaProductoResponse {
    private Integer id;
    private String nombre;
    private String descripcion;
    private String marca;
    private BigDecimal precioVenta;
    private Integer stockActual;
    private String imagenUrl;
    private Boolean destacado;
    private CategoriaLigera categoria;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoriaLigera {
        private Integer id;
        private String nombre;
    }
}
