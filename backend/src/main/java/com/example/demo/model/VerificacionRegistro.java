package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Registro de cliente pendiente de verificar el correo. Vive solo entre la
 * petición de registro y la comprobación del código (o su caducidad): guarda
 * los datos del registro y el hash del código, nunca el código en claro.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "verificacion_registro")
public class VerificacionRegistro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // EAGER, no LAZY: Empresa declara @SoftDelete y Hibernate rechaza las
    // asociaciones diferidas hacia entidades con borrado lógico.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false, length = 150)
    private String correo;

    @Column(length = 150)
    private String nombres;

    @Column(length = 150)
    private String apellidos;

    @Column(length = 30)
    private String telefono;

    @Column(length = 255)
    private String direccion;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "codigo_hash", nullable = false, length = 255)
    private String codigoHash;

    @Column(nullable = false)
    private Integer intentos = 0;

    @Column(name = "expira_en", nullable = false)
    private LocalDateTime expiraEn;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;
}
