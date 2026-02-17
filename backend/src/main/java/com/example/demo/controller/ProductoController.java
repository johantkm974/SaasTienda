package com.example.demo.controller;

import com.example.demo.model.Producto;
import com.example.demo.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @PostMapping
    public Producto guardar(@RequestBody Producto producto) {
        return productoService.guardar(producto);
    }

    @GetMapping("/empresa/{empresaId}")
    public List<Producto> listar(@PathVariable Integer empresaId) {
        return productoService.listarPorEmpresa(empresaId);
    }

    @GetMapping("/{id}/empresa/{empresaId}")
    public Producto buscar(@PathVariable Integer id,
                           @PathVariable Integer empresaId) {
        return productoService.buscarPorIdYEmpresa(id, empresaId);
    }
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id){
        productoService.eliminar(id);

    }
    @GetMapping 
    public List<Producto> listarTodos() {
        return productoService.listarTodos(); 
    }
}
