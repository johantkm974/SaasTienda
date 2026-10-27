package com.example.demo.repository;

import com.example.demo.model.Envio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnvioRepository extends JpaRepository<Envio, Integer> {

    List<Envio> findByEmpresaId(Integer empresaId);

    List<Envio> findByEmpresaIdAndEstadoEnvio(Integer empresaId, String estadoEnvio);

    Optional<Envio> findByIdAndEmpresaId(Integer id, Integer empresaId);

    Optional<Envio> findByVentaIdAndEmpresaId(Integer ventaId, Integer empresaId);
}
