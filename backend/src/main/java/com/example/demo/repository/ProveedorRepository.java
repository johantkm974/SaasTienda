package com.example.demo.repository;
import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {
    List<Proveedor> findByEmpresaId(Integer empresaId);
    Optional<Proveedor> findByIdAndEmpresaId(Integer id, Integer empresaId);
    boolean existsByIdAndEmpresaId(Integer id, Integer empresaId);

}