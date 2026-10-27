package com.example.demo.controller;

import com.example.demo.model.Categoria;
import com.example.demo.service.CategoriaService;
import com.example.demo.service.JwtService;
import com.example.demo.service.TiendaContext;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;
    private final TiendaContext tiendaContext;
    private final JwtService jwtService;

    @GetMapping("/activas")
    public List<Categoria> listarCategoriasActivas() {
        return categoriaService.listarPorEmpresa(tiendaContext.empresaIdActual()).stream()
                .filter(c -> Boolean.TRUE.equals(c.getVisibleTienda()))
                .toList();
    }

    @GetMapping
    public List<Categoria> listar(@RequestHeader("Authorization") String token) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return categoriaService.listarPorEmpresa(empresaId);
    }

    // El SUPREMO puede ver las categorias de cualquier empresa
    @GetMapping("/empresa/{empresaId}")
    @PreAuthorize("hasRole('SUPREMO')")
    public List<Categoria> listarPorEmpresaId(@PathVariable Integer empresaId) {
        return categoriaService.listarPorEmpresa(empresaId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Categoria crear(@RequestBody Categoria categoria,
                           @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return categoriaService.crearConEmpresa(categoria, empresaId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Categoria actualizar(@PathVariable Integer id,
                                @RequestBody Categoria categoria,
                                @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return categoriaService.actualizarSeguro(id, categoria, empresaId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void eliminar(@PathVariable Integer id,
                         @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        categoriaService.eliminarSeguro(id, empresaId);
    }
}
