package com.example.demo.controller;

import com.example.demo.model.Categoria;
import com.example.demo.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @PostMapping
    public Categoria crear(@RequestBody Categoria categoria) {
        return categoriaService.crear(categoria);
    }

    @PutMapping("/{id}")
    public Categoria actualizar(@PathVariable Integer id, @RequestBody Categoria categoria) {
        return categoriaService.actualizar(id, categoria);
    }

    @GetMapping
    public List<Categoria> listar() {
        return categoriaService.listar();
    }

    @GetMapping("/empresa/{empresaId}")
    public List<Categoria> listarPorEmpresa(@PathVariable Integer empresaId) {
        return categoriaService.listarPorEmpresa(empresaId);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        categoriaService.eliminar(id);
    }
}