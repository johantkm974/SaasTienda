package com.example.demo.repository;

import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Integer> {
    // Para login o configuraciones
    Optional<Empresa> findByRuc(String ruc);
}

