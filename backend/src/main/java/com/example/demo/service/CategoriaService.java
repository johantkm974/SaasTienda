package com.example.demo.service;

import com.example.demo.model.Categoria;
import com.example.demo.model.Empresa;
import com.example.demo.repository.CategoriaRepository;
import com.example.demo.repository.EmpresaRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final EmpresaRepository empresaRepository; // 👈 FALTABA ESTO

    public Categoria crearConEmpresa(Categoria categoria, Integer empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        categoria.setEmpresa(empresa);
        return categoriaRepository.save(categoria);
    }

    public Categoria actualizarSeguro(Integer id, Categoria actualizada, Integer empresaId) {
        return categoriaRepository.findByIdAndEmpresaId(id, empresaId)
                .map(existente -> {
                    existente.setNombre(actualizada.getNombre());
                    existente.setDescripcion(actualizada.getDescripcion());
                    return categoriaRepository.save(existente);
                })
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada en su empresa"));
    }

    public List<Categoria> listarPorEmpresa(Integer empresaId) {
        return categoriaRepository.findByEmpresaId(empresaId);
    }

    public void eliminarSeguro(Integer id, Integer empresaId) {
        Categoria categoria = categoriaRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada en su empresa"));

        categoriaRepository.delete(categoria);
    }
}
