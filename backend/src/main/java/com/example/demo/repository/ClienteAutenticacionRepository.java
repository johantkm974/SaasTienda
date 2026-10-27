package com.example.demo.repository;

import com.example.demo.model.ClienteAutenticacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteAutenticacionRepository extends JpaRepository<ClienteAutenticacion, Integer> {

    Optional<ClienteAutenticacion> findByCorreo(String correo);

    Optional<ClienteAutenticacion> findByClienteId(Integer clienteId);
}
