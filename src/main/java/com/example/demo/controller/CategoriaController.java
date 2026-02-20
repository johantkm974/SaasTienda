package com.example.demo.controller;

import com.example.demo.model.Categoria;
import com.example.demo.service.CategoriaService;
import com.example.demo.service.JwtService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;
    private final JwtService jwtService;

    @GetMapping
    public List<Categoria> listar(@RequestHeader("Authorization") String token) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return categoriaService.listarPorEmpresa(empresaId);
    }

    @PostMapping
    public Categoria crear(@RequestBody Categoria categoria,
                           @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return categoriaService.crearConEmpresa(categoria, empresaId);
    }

    @PutMapping("/{id}")
    public Categoria actualizar(@PathVariable Integer id,
                                @RequestBody Categoria categoria,
                                @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return categoriaService.actualizarSeguro(id, categoria, empresaId);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id,
                         @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        categoriaService.eliminarSeguro(id, empresaId);
    }
}
