package com.example.demo.repository;
import com.example.demo.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    List<Categoria> findByEmpresaId(Integer empresaId);

    Optional<Categoria> findByIdAndEmpresaId(Integer id, Integer empresaId);

    boolean existsByIdAndEmpresaId(Integer id, Integer empresaId);
}
