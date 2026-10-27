package com.example.demo.controller;

import com.example.demo.model.Proveedor;
import com.example.demo.service.JwtService;
import com.example.demo.service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;
    private final JwtService jwtService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Proveedor guardar(@RequestBody Proveedor proveedor,
                             @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return proveedorService.crearSeguro(proveedor, empresaId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
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

    // El SUPREMO puede ver los proveedores de cualquier empresa
    @GetMapping("/empresa/{empresaId}")
    @PreAuthorize("hasRole('SUPREMO')")
    public List<Proveedor> listarPorEmpresaId(@PathVariable Integer empresaId) {
        return proveedorService.listarPorEmpresa(empresaId);
    }

    @GetMapping("/{id}")
    public Proveedor buscar(@PathVariable Integer id,
                            @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return proveedorService.buscarPorIdSeguro(id, empresaId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void eliminar(@PathVariable Integer id,
                         @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        proveedorService.eliminarSeguro(id, empresaId);
    }
}
