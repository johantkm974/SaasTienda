package com.example.demo.controller;

import com.example.demo.model.Empresa;
import com.example.demo.service.EmpresaService;
import com.example.demo.service.JwtService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaService empresaService;
    private final JwtService jwtService;

    // Solo ver la información de MI empresa
    @GetMapping("/mi-empresa")
    public Empresa buscarMiEmpresa(@RequestHeader("Authorization") String token) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return empresaService.buscarPorId(empresaId);
    }

    // Actualizar solo MI empresa
    @PutMapping("/actualizar")
    public Empresa actualizarMiEmpresa(@RequestHeader("Authorization") String token, @RequestBody Empresa empresa) {
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return empresaService.actualizar(empresaId, empresa);
    }
}

