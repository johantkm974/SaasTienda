package com.example.demo.repository;
import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {
    List<Producto> findByEmpresaId(Integer empresaId);
    // Para validar stock antes de vender
    Optional<Producto> findByIdAndEmpresaId(Integer id, Integer empresaId);
}