package com.example.demo.model;
import lombok.*;
import java.time.*;
import jakarta.persistence.*;

@Entity
@Table(name = "empresa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
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
    

    @PrePersist
    protected void prePersist() {
        if (this.estado == null) this.estado = EstadoEmpresa.ACTIVO;
       
    }

}
