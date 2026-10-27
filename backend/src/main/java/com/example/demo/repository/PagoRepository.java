package com.example.demo.repository;

import com.example.demo.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {

    List<Pago> findByEmpresaId(Integer empresaId);

    List<Pago> findByVentaIdAndEmpresaId(Integer ventaId, Integer empresaId);

    Optional<Pago> findByPreferenceId(String preferenceId);

    Optional<Pago> findByExternalId(String externalId);

    Optional<Pago> findTopByVentaIdOrderByIdDesc(Integer ventaId);
}
