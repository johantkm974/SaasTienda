package com.example.demo.controller;

import com.example.demo.service.CredencialService;
import com.example.demo.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Gestión de credenciales de integración por empresa (Mercado Pago, PayPal,
 * Cloudinary, email/Brevo). Los valores se guardan cifrados y al leer se
 * devuelven enmascarados (nunca se expone el secreto completo).
 */
@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
public class CredencialController {

    private final CredencialService credencialService;
    private final JwtService jwtService;

    @GetMapping("/mi-empresa/credenciales")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','SUPREMO')")
    public Map<String, Object> resumenMiEmpresa(@RequestHeader("Authorization") String token) {
        return credencialService.resumen(jwtService.obtenerEmpresaIdDeToken(token));
    }

    @PutMapping("/mi-empresa/credenciales/{proveedor}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Map<String, Object> guardarMiEmpresa(@PathVariable String proveedor,
                                                @RequestBody Map<String, String> datos,
                                                @RequestHeader("Authorization") String token) {
        return credencialService.guardar(
                jwtService.obtenerEmpresaIdDeToken(token), proveedor.toUpperCase(), datos);
    }

    // ============ SUPERADMIN: credenciales de cualquier empresa ============

    @GetMapping("/{id}/credenciales")
    @PreAuthorize("hasRole('SUPREMO')")
    public Map<String, Object> resumenDeEmpresa(@PathVariable Integer id) {
        return credencialService.resumen(id);
    }

    @PutMapping("/{id}/credenciales/{proveedor}")
    @PreAuthorize("hasRole('SUPREMO')")
    public Map<String, Object> guardarDeEmpresa(@PathVariable Integer id,
                                                @PathVariable String proveedor,
                                                @RequestBody Map<String, String> datos) {
        return credencialService.guardar(id, proveedor.toUpperCase(), datos);
    }
}
