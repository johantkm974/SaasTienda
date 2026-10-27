package com.example.demo.model;
import lombok.*;
import java.math.BigDecimal;
import java.time.*;
import jakarta.persistence.*;
import org.hibernate.annotations.SoftDelete;

@Entity
@Table(name = "empresa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@SoftDelete(columnName = "eliminado")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nombre_comercial", nullable = false, length = 100)
    private String nombreComercial;

    @Column(nullable = false, length = 11)
    private String ruc;

    @Column(name = "fecha_registro",insertable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Enumerated(EnumType.STRING)
    private EstadoEmpresa estado;
    @Column(name = "logo_url")
    private String logoUrl;
    private String telefono;

    @Column(name = "slogan")
    private String slogan;

    @Column(name = "color_primario", nullable = false, length = 20)
    private String colorPrimario = "#10b981";

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "mostrar_stock", nullable = false)
    private Boolean mostrarStock = true;

    @Column(name = "costo_envio", precision = 10, scale = 2)
    private BigDecimal costoEnvio = BigDecimal.ZERO;

    @Column(name = "envio_gratis_desde", precision = 10, scale = 2)
    private BigDecimal envioGratisDesde;

    @Column(name = "contra_entrega", nullable = false)
    private Boolean contraEntrega = false;

    @Column(name = "contra_entrega_maximo", precision = 10, scale = 2)
    private BigDecimal contraEntregaMaximo;

    @PrePersist
    protected void prePersist() {
        if (this.estado == null) this.estado = EstadoEmpresa.ACTIVO;
        if (this.colorPrimario == null) this.colorPrimario = "#10b981";
        if (this.mostrarStock == null) this.mostrarStock = true;
        if (this.contraEntrega == null) this.contraEntrega = false;
    }

}
