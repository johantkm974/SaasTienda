package com.example.demo.controller;

import com.example.demo.dto.EnvioDashboardResponse;
import com.example.demo.dto.EnvioUpdateRequest;
import com.example.demo.model.Envio;
import com.example.demo.service.EnvioService;
import com.example.demo.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/envios")
@RequiredArgsConstructor
public class EnvioController {

    private final EnvioService envioService;
    private final JwtService jwtService;

    @GetMapping
    public List<EnvioDashboardResponse> listar(@RequestHeader("Authorization") String token) {
        return envioService.listarPorEmpresa(jwtService.obtenerEmpresaIdDeToken(token));
    }

    @GetMapping("/estado/{estado}")
    public List<EnvioDashboardResponse> listarPorEstado(@PathVariable String estado,
                                        @RequestHeader("Authorization") String token) {
        return envioService.listarPorEstado(jwtService.obtenerEmpresaIdDeToken(token), estado);
    }

    @GetMapping("/venta/{ventaId}")
    public Envio porVenta(@PathVariable Integer ventaId,
                          @RequestHeader("Authorization") String token) {
        return envioService.buscarPorVenta(ventaId, jwtService.obtenerEmpresaIdDeToken(token));
    }

    @PutMapping("/{id}/estado/{estado}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Envio cambiarEstado(@PathVariable Integer id,
                               @PathVariable String estado,
                               @RequestHeader("Authorization") String token) {
        return envioService.cambiarEstado(id, jwtService.obtenerEmpresaIdDeToken(token), estado);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Envio actualizar(@PathVariable Integer id,
                            @RequestBody EnvioUpdateRequest envio,
                            @RequestHeader("Authorization") String token) {
        return envioService.actualizar(id, jwtService.obtenerEmpresaIdDeToken(token), envio);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void eliminar(@PathVariable Integer id,
                         @RequestHeader("Authorization") String token) {
        envioService.eliminar(id, jwtService.obtenerEmpresaIdDeToken(token));
    }
}
