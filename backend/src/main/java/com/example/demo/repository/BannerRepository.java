package com.example.demo.repository;

import com.example.demo.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BannerRepository extends JpaRepository<Banner, Integer> {

    List<Banner> findByEmpresaIdOrderByOrdenAsc(Integer empresaId);

    List<Banner> findByEmpresaIdAndPaginaAndActivoTrueOrderByOrdenAsc(Integer empresaId, String pagina);

    Optional<Banner> findByIdAndEmpresaId(Integer id, Integer empresaId);
}
