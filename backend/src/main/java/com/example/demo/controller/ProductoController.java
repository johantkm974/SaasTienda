package com.example.demo.controller;

import com.example.demo.model.Producto;
import com.example.demo.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    // 🔒 Solo Admin y Vendedor pueden crear
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR')")
    public Producto crear(@RequestBody Producto producto) {
        return productoService.crear(producto);
    }

    // 🔒 Solo Admin y Vendedor pueden editar (CORREGIDO)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'VENDEDOR')")
    public Producto actualizar(@PathVariable Integer id, @RequestBody Producto producto){
        return productoService.actualizar(id, producto);
    }

    // 🔓 Acceso para todos los usuarios autenticados (incluyendo Clientes)
    @GetMapping("/empresa/{empresaId}")
    public List<Producto> listar(@PathVariable Integer empresaId) {
        return productoService.listarPorEmpresa(empresaId);
    }

    @GetMapping("/{id}/empresa/{empresaId}")
    public Producto buscar(@PathVariable Integer id, @PathVariable Integer empresaId) {
        return productoService.buscarPorIdYEmpresa(id, empresaId);
    }

    // 🔒 SOLO el Administrador puede borrar
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void eliminar(@PathVariable Integer id){
        productoService.eliminar(id);
    }

    @GetMapping 
    public List<Producto> listarTodos() {
        return productoService.listarTodos(); 
    }
}