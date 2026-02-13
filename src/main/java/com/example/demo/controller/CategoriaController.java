package com.example.demo.controller;

import com.example.demo.model.Categoria;
import com.example.demo.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias") // <--- ESTA ES LA RUTA QUE USA EL JS
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    // GET /api/categorias -> Devuelve la lista para el <select>
    @GetMapping
    public List<Categoria> listar() {
        return categoriaService.listar();
    }

    // POST /api/categorias -> Crea o Edita
    @PostMapping
    public Categoria guardar(@RequestBody Categoria categoria) {
        return categoriaService.guardar(categoria);
    }

    // GET /api/categorias/empresa/1 -> Lista filtrada (Opcional, pero útil)
    @GetMapping("/empresa/{empresaId}")
    public List<Categoria> listarPorEmpresa(@PathVariable Integer empresaId) {
        return categoriaService.listarPorEmpresa(empresaId);
    }

    // DELETE /api/categorias/5 -> Elimina
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        categoriaService.eliminar(id);
    }
}