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
@Table(name = "categoria")
public class Categoria extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    @Column(name = "visible_tienda", nullable = false)
    private Boolean visibleTienda = true;

}
