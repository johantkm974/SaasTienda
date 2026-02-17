package com.example.demo.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "venta")
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario; // Cliente
    @Column(insertable = false, updatable = false)
    private LocalDateTime fecha;

    @Column(name = "total_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalVenta;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Column(name = "estado_pago", length = 50)
    private String estadoPago;

    // Relación inversa para acceder a los detalles desde la venta
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleVenta> detalles;

    @PrePersist
    public void prePersist() {
        if (this.estadoPago == null) this.estadoPago = "PENDIENTE";
    }

}
