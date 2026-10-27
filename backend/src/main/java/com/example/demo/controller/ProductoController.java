package com.example.demo.controller;

import com.example.demo.model.Producto;
import com.example.demo.service.JwtService;
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
    private final JwtService jwtService;

    @GetMapping
    public List<Producto> listar(@RequestHeader("Authorization") String token) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return productoService.listarPorEmpresa(empresaId);
    }

    // El SUPREMO puede ver los productos de cualquier empresa
    @GetMapping("/empresa/{empresaId}")
    @PreAuthorize("hasRole('SUPREMO')")
    public List<Producto> listarPorEmpresaId(@PathVariable Integer empresaId) {
        return productoService.listarPorEmpresa(empresaId);
    }

    @GetMapping("/{id}")
    public Producto buscar(@PathVariable Integer id, @RequestHeader("Authorization") String token) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return productoService.buscarPorIdYEmpresa(id, empresaId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Producto crear(@RequestBody Producto producto, @RequestHeader("Authorization") String token) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return productoService.crearConEmpresa(producto, empresaId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Producto actualizar(@PathVariable Integer id, @RequestBody Producto producto, @RequestHeader("Authorization") String token){
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return productoService.actualizarSeguro(id, producto, empresaId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void eliminar(@PathVariable Integer id, @RequestHeader("Authorization") String token){
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        productoService.eliminarSeguro(id, empresaId);
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
}