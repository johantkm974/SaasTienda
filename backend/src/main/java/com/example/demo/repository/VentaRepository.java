package com.example.demo.repository;

import com.example.demo.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VentaRepository extends JpaRepository<Venta, Integer> {

    List<Venta> findByEmpresaId(Integer empresaId);

    List<Venta> findByUsuarioIdAndEmpresaId(Integer usuarioId, Integer empresaId);

    List<Venta> findByClienteIdAndEmpresaId(Integer clienteId, Integer empresaId);

    @Query("SELECT DISTINCT d.producto FROM DetalleVenta d WHERE d.venta.empresa.id = :empresaId")
    List<Producto> findProductosCompradosPorEmpresa(@Param("empresaId") Integer empresaId);

    Optional<Venta> findByIdAndEmpresaId(Integer id, Integer empresaId);

    Page<Venta> findByEmpresaId(Integer empresaId, Pageable pageable);

    Page<Venta> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta, Pageable pageable);

    Page<Venta> findByEmpresaIdAndFechaBetween(Integer empresaId, LocalDateTime desde, LocalDateTime hasta, Pageable pageable);
}
