package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "contenido_pagina")
public class ContenidoPagina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Column(nullable = false, length = 50)
    private String vista;

    @Column(nullable = false, length = 100)
    private String clave;

    @Column(name = "valor_texto", columnDefinition = "TEXT")
    private String valorTexto;

    @Column(name = "imagen_url", columnDefinition = "TEXT")
    private String imagenUrl;

    @Column(nullable = false)
    private Boolean activo = true;
}
