package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cliente")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Column(nullable = false, length = 100)
    private String nombres;

    @Column(length = 100)
    private String apellidos;

    @Column(nullable = false, length = 150)
    private String correo;

    @Column(length = 20)
    private String telefono;

    @Column(length = 255)
    private String direccion;

    @Column(nullable = false, length = 20)
    private String estado = "ACTIVO";

    @Column(name = "password_hash")
    @JsonIgnore
    private String passwordHash;

    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void prePersist() {
        if (this.estado == null) this.estado = "ACTIVO";
    }
}
