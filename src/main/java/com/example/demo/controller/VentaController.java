package com.example.demo.controller;

import com.example.demo.model.Venta;
import com.example.demo.service.JwtService;
import com.example.demo.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;
    private final JwtService jwtService;

    @PostMapping
    public Venta registrar(@RequestBody Venta venta,
                           @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return ventaService.registrarVenta(venta, empresaId);
    }

    @GetMapping("/{id}")
    public Venta buscar(@PathVariable Integer id,
                        @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return ventaService.buscarPorIdSeguro(id, empresaId);
    }

    @GetMapping
    public List<Venta> listar(@RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return ventaService.listarPorEmpresa(empresaId);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Venta> listarPorUsuario(@PathVariable Integer usuarioId,
                                        @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return ventaService.listarPorUsuarioSeguro(usuarioId, empresaId);
    }
}
