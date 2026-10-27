package com.example.demo.repository;

import com.example.demo.model.ContenidoPagina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContenidoPaginaRepository extends JpaRepository<ContenidoPagina, Integer> {

    List<ContenidoPagina> findByEmpresaId(Integer empresaId);

    List<ContenidoPagina> findByEmpresaIdAndVistaAndActivoTrue(Integer empresaId, String vista);

    Optional<ContenidoPagina> findByEmpresaIdAndVistaAndClave(Integer empresaId, String vista, String clave);

    Optional<ContenidoPagina> findByIdAndEmpresaId(Integer id, Integer empresaId);
}
