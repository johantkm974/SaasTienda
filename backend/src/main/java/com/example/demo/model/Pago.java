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
@Table(name = "pago")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "venta_id")
    private Venta venta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Column(nullable = false, length = 30)
    private String proveedor = "MERCADO_PAGO";

    @Column(name = "external_id", length = 200)
    private String externalId;

    @Column(name = "preference_id", length = 200)
    private String preferenceId;

    @Column(name = "payment_id_mp", length = 200)
    private String paymentIdMp;

    @Column(name = "init_point", length = 500)
    private String initPoint;

    @Column(nullable = false, length = 30)
    private String estado = "CREADO";

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "fecha_creacion", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_confirmacion")
    private LocalDateTime fechaConfirmacion;
}
