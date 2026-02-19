package com.example.demo.repository;

import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {

    List<Compra> findByEmpresaId(Integer empresaId);

    Optional<Compra> findByIdAndEmpresaId(Integer id, Integer empresaId);
}
