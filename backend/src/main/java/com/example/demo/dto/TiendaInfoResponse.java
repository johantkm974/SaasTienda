package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TiendaInfoResponse {
    private Integer id;
    private String nombreComercial;
    private String logoUrl;
    private String slogan;
    private String colorPrimario;
    private String bannerUrl;
    private Boolean mostrarStock;
    private Boolean activa;
    private Boolean contraEntrega;
    private BigDecimal contraEntregaMaximo;
    private BigDecimal costoEnvio;
    private BigDecimal envioGratisDesde;
    private List<CategoriaTiendaResponse> categorias;
    private List<TiendaProductoResponse> productos;
    private List<BannerTiendaResponse> banners;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoriaTiendaResponse {
        private Integer id;
        private String nombre;
        private String descripcion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BannerTiendaResponse {
        private Integer id;
        private String titulo;
        private String subtitulo;
        private String descripcion;
        private String imagenUrl;
        private String enlace;
    }
}
