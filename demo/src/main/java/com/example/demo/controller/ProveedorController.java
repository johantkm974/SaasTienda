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
        return proveedorService.guardar(proveedor);
    }

    @GetMapping("/empresa/{empresaId}")
    public List<Proveedor> listar(@PathVariable Integer empresaId) {
        return proveedorService.listarPorEmpresa(empresaId);
    }
}
