package com.example.demo.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SoftDelete;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@SoftDelete(columnName = "eliminado")
@Entity
@Table(name = "proveedor")
public class Proveedor extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 20)
    private String identificacion;

    @Column(length = 20)
    private String telefono;

    @Column(length = 100)
    private String correo;

}
