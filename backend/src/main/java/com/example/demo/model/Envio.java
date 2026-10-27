package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "envio")
public class Envio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "venta_id")
    private Venta venta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Column(name = "direccion_entrega", nullable = false, length = 255)
    private String direccionEntrega;

    @Column(nullable = false, length = 100)
    private String distrito;

    @Column(name = "costo_envio", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoEnvio = BigDecimal.ZERO;

    @Column(name = "estado_envio", nullable = false, length = 20)
    private String estadoEnvio = "PREPARACION";

    @Column(name = "fecha_despacho")
    private LocalDateTime fechaDespacho;

    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    @Column(length = 100)
    private String transportista;

    @Column(name = "guia_tracking", length = 100)
    private String guiaTracking;
}
