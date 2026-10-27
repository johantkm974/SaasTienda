package com.example.demo.repository;

import com.example.demo.model.CredencialEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CredencialEmpresaRepository extends JpaRepository<CredencialEmpresa, Integer> {

    Optional<CredencialEmpresa> findByEmpresaIdAndProveedor(Integer empresaId, String proveedor);

    List<CredencialEmpresa> findByEmpresaId(Integer empresaId);
}
