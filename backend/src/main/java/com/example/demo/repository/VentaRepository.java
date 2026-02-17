package com.example.demo.repository;
import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {
    List<Venta> findByEmpresaId(Integer empresaId);
}