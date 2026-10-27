package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "banner")
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 200)
    private String subtitulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "imagen_url", columnDefinition = "TEXT")
    private String imagenUrl;

    @Column(length = 255)
    private String enlace;

    @Column(nullable = false)
    private Integer orden = 0;

    @Column(nullable = false, length = 50)
    private String pagina = "tienda";

    @Column(nullable = false)
    private Boolean activo = true;
}
