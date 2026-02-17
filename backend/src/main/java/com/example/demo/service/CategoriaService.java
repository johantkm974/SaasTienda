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

    // 1. Guardar o Editar (Igual que en Producto)
    public Categoria guardar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    // 2. Listar TODAS (Para el dropdown general)
    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    // 3. Listar solo de una empresa (Para filtrar por tenant)
    public List<Categoria> listarPorEmpresa(Integer empresaId) {
        return categoriaRepository.findByEmpresaId(empresaId);
    }

    // 4. Buscar una por ID
    public Categoria buscarPorId(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    }

    // 5. Eliminar
    public void eliminar(Integer id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RuntimeException("No se puede eliminar, la categoría no existe");
        }
        categoriaRepository.deleteById(id);
    }
}