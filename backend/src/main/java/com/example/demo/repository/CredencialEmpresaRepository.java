package com.example.demo.repository;

import com.example.demo.model.CredencialEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CredencialEmpresaRepository extends JpaRepository<CredencialEmpresa, Integer> {

    Optional<CredencialEmpresa> findByEmpresaIdAndProveedor(Integer empresaId, String proveedor);

    List<CredencialEmpresa> findByEmpresaId(Integer empresaId);
}
