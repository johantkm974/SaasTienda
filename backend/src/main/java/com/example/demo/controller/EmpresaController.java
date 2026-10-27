package com.example.demo.controller;

import com.example.demo.model.Empresa;
import com.example.demo.model.EstadoEmpresa;
import com.example.demo.service.CloudinaryService;
import com.example.demo.service.EmpresaService;
import com.example.demo.service.JwtService;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaService empresaService;
    private final JwtService jwtService;
    private final CloudinaryService cloudinaryService;

    // Solo ver la información de MI empresa
    @GetMapping("/mi-empresa")
    public Empresa buscarMiEmpresa(@RequestHeader("Authorization") String token) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return empresaService.buscarPorId(empresaId);
    }

    // Actualizar solo MI empresa
    @PutMapping("/actualizar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Empresa actualizarMiEmpresa(@RequestHeader("Authorization") String token, @RequestBody Empresa empresa) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return empresaService.actualizar(empresaId, empresa);
    }

    // Subir logo o banner de MI empresa a Cloudinary
    @PostMapping("/imagen")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Map<String, String> subirImagen(@RequestHeader("Authorization") String token,
                                           @RequestBody Map<String, String> body) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        String url = cloudinaryService.subirBase64(empresaId, body.get("imagenBase64"));
        return Map.of("imagenUrl", url);
    }

    // ============ ENDPOINTS DEL SUPERADMIN (SUPREMO) ============

    // Listar todas las empresas del SaaS
    @GetMapping
    @PreAuthorize("hasRole('SUPREMO')")
    public List<Empresa> listarTodas() {
        return empresaService.listar();
    }

    // Suspender / activar una empresa
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('SUPREMO')")
    public Empresa cambiarEstado(@PathVariable Integer id,
                                 @RequestParam EstadoEmpresa estado) {
        return empresaService.cambiarEstado(id, estado);
    }

    // Ver una empresa por ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPREMO')")
    public Empresa buscarPorId(@PathVariable Integer id) {
        return empresaService.buscarPorId(id);
    }

    // Crear una empresa manualmente
    @PostMapping
    @PreAuthorize("hasRole('SUPREMO')")
    public Empresa crear(@RequestBody Empresa empresa) {
        return empresaService.registrar(empresa);
    }

    // Editar cualquier empresa
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPREMO')")
    public Empresa actualizar(@PathVariable Integer id, @RequestBody Empresa empresa) {
        return empresaService.actualizar(id, empresa);
    }

    // Eliminar (soft delete) una empresa
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPREMO')")
    public void eliminar(@PathVariable Integer id) {
        empresaService.eliminar(id);
    }
}
