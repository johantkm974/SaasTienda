package com.example.demo.repository;
import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {
    List<Proveedor> findByEmpresaId(Integer empresaId);
    Optional<Proveedor> findByIdAndEmpresaId(Integer id, Integer empresaId);
    boolean existsByIdAndEmpresaId(Integer id, Integer empresaId);

}