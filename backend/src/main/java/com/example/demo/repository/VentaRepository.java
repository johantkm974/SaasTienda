package com.example.demo.repository;

import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
    
    // Buscar todas las ventas de una empresa
    List<Venta> findByEmpresaId(Integer empresaId);
    
    // NUEVO: Buscar todas las compras de un cliente (Usuario)
    List<Venta> findByUsuarioId(Integer usuarioId);
}