package com.example.demo.model;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SoftDelete;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@SoftDelete(columnName = "eliminado")
@Entity
@Table(name = "producto")
public class Producto extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(name = "stock_actual", nullable = false)
    private Integer stockActual;
    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 5;

    @Column(name = "imagen_url")
    private String imagenUrl;

    @Column(name = "codigo_sku", length = 50)
    private String codigoSku;

    @Column(length = 100)
    private String marca;

    @Column(nullable = false)
    private Boolean destacado = false;

    @Transient
    private BigDecimal costoUnitario;

}
