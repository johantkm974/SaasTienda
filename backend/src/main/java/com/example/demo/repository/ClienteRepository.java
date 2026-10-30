package com.example.demo.repository;

import com.example.demo.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    List<Cliente> findByEmpresaId(Integer empresaId);

    Optional<Cliente> findByIdAndEmpresaId(Integer id, Integer empresaId);

    Optional<Cliente> findByCorreoAndEmpresaId(String correo, Integer empresaId);
}
