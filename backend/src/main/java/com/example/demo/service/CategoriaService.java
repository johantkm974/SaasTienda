package com.example.demo.service;

import com.example.demo.model.Categoria;
import com.example.demo.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    // 1. CREAR (Protegido)
    public Categoria crear(Categoria categoria) {
        categoria.setId(null);
        return categoriaRepository.save(categoria);
    }

    // 2. ACTUALIZAR (Controlado)
    public Categoria actualizar(Integer id, Categoria categoriaActualizada) {
        return categoriaRepository.findById(id).map(categoriaExistente -> {
            categoriaExistente.setNombre(categoriaActualizada.getNombre());
            categoriaExistente.setDescripcion(categoriaActualizada.getDescripcion());
            categoriaExistente.setEmpresa(categoriaActualizada.getEmpresa());
            
            return categoriaRepository.save(categoriaExistente);
        }).orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    }

    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    public List<Categoria> listarPorEmpresa(Integer empresaId) {
        return categoriaRepository.findByEmpresaId(empresaId);
    }

    public Categoria buscarPorId(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    }

    public void eliminar(Integer id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("No se puede eliminar, la categoría no existe");
        }
        categoriaRepository.deleteById(id);
    }
}