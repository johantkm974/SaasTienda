package com.example.demo.repository;

import com.example.demo.model.VerificacionRegistro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface VerificacionRegistroRepository extends JpaRepository<VerificacionRegistro, Integer> {

    Optional<VerificacionRegistro> findByEmpresaIdAndCorreo(Integer empresaId, String correo);

    @Transactional
    void deleteByEmpresaIdAndCorreo(Integer empresaId, String correo);
}
