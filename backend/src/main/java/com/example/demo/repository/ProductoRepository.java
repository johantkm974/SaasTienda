package com.example.demo.repository;
import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByEmpresaId(Integer empresaId);
    Optional<Producto> findByIdAndEmpresaId(Integer id, Integer empresaId);

    @Modifying
    @Query("UPDATE Producto p SET p.stockActual = p.stockActual - :cantidad " +
            "WHERE p.id = :id AND p.empresa.id = :empresaId AND p.stockActual >= :cantidad")
    int decrementarStock(@Param("id") Integer id,
                         @Param("empresaId") Integer empresaId,
                         @Param("cantidad") Integer cantidad);

    @Modifying
    @Query("UPDATE Producto p SET p.stockActual = p.stockActual + :cantidad " +
            "WHERE p.id = :id AND p.empresa.id = :empresaId")
    int incrementarStock(@Param("id") Integer id,
                         @Param("empresaId") Integer empresaId,
                         @Param("cantidad") Integer cantidad);
}
