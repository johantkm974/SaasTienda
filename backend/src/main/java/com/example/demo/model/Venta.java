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
    private Usuario usuario; // Vendedor que atendió

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente; // Cliente (tabla aparte, no usuario del sistema)

    @Column
    private LocalDateTime fecha;

    @Column(name = "total_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalVenta;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Column(name = "estado_pago", length = 50)
    private String estadoPago;

    @Column(name = "estado_venta", length = 30)
    private String estadoVenta;

    @Column(name = "stock_reservado", nullable = false)
    private Boolean stockReservado = false;

    // Relación inversa para acceder a los detalles desde la venta
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleVenta> detalles;

    @PrePersist
    public void prePersist() {
        if (this.fecha == null) this.fecha = LocalDateTime.now();
        if (this.estadoPago == null) this.estadoPago = "PENDIENTE";
        if (this.estadoVenta == null) this.estadoVenta = "PENDIENTE_PAGO";
    }

}
