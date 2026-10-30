package com.example.demo.repository;

import com.example.demo.model.ClienteAutenticacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteAutenticacionRepository extends JpaRepository<ClienteAutenticacion, Integer> {

    Optional<ClienteAutenticacion> findByCorreo(String correo);

    Optional<ClienteAutenticacion> findByClienteId(Integer clienteId);
}
