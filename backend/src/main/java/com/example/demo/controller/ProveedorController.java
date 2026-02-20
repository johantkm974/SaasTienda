package com.example.demo.controller;

import com.example.demo.model.Proveedor;
import com.example.demo.service.JwtService;
import com.example.demo.service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;
    private final JwtService jwtService;

    @PostMapping
    public Proveedor guardar(@RequestBody Proveedor proveedor,
                             @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return proveedorService.crearSeguro(proveedor, empresaId);
    }

    @PutMapping("/{id}")
    public Proveedor actualizar(@PathVariable Integer id,
                                @RequestBody Proveedor proveedor,
                                @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return proveedorService.actualizarSeguro(id, proveedor, empresaId);
    }

    @GetMapping
    public List<Proveedor> listar(@RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return proveedorService.listarPorEmpresa(empresaId);
    }

    @GetMapping("/{id}")
    public Proveedor buscar(@PathVariable Integer id,
                            @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return proveedorService.buscarPorIdSeguro(id, empresaId);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id,
                         @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        proveedorService.eliminarSeguro(id, empresaId);
    }
}

