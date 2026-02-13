package com.example.demo.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import jakarta.persistence.*;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "compra")
public class Compra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @ManyToOne(optional = false)
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    @Column(insertable = false, updatable = false)
    private LocalDateTime fecha;

    @Column(name = "total_compra", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCompra;

    @Column(name = "numero_comprobante", length = 50)
    private String numeroComprobante;

    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleCompra> detalles;
}
