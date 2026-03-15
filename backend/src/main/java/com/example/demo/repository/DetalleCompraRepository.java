package com.example.demo.repository;

import com.example.demo.model.DetalleCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DetalleCompraRepository 
        extends JpaRepository<DetalleCompra, Integer> {

    Optional<DetalleCompra> 
    findTopByProductoIdOrderByIdDesc(Integer productoId);

}