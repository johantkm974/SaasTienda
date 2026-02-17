package com.example.demo.controller;

import com.example.demo.model.Proveedor;
import com.example.demo.service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @PostMapping
    public Proveedor guardar(@RequestBody Proveedor proveedor) {
        return proveedorService.crear(proveedor);
    }   
    @PutMapping("/{id}")
    public Proveedor actualizar(@PathVariable Integer id, @RequestBody Proveedor proveedor) {
        return proveedorService.actualizar(id, proveedor);
    }

    @GetMapping
    public List<Proveedor> listarTodos() {
        return proveedorService.listarTodos();
    }

    @GetMapping("/{id}")
    public Proveedor buscar(@PathVariable Integer id) {
        return proveedorService.buscarPorId(id);
    }

    @GetMapping("/empresa/{empresaId}")
    public List<Proveedor> listarPorEmpresa(@PathVariable Integer empresaId) {
        return proveedorService.listarPorEmpresa(empresaId);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        proveedorService.eliminar(id);
    }
}
