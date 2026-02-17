package com.example.demo.controller;

import com.example.demo.model.Venta;
import com.example.demo.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    // CREAR VENTA (El que ya tenías)
    @PostMapping
    public Venta registrar(@RequestBody Venta venta) {
        return ventaService.registrarVenta(venta);
    }

    // VER EL RECIBO DE UNA VENTA ESPECÍFICA
    @GetMapping("/{id}")
    public Venta buscar(@PathVariable Integer id) {
        return ventaService.buscarPorId(id);
    }

    // VER TODAS LAS VENTAS DE UNA EMPRESA
    @GetMapping("/empresa/{empresaId}")
    public List<Venta> listarPorEmpresa(@PathVariable Integer empresaId) {
        return ventaService.listarPorEmpresa(empresaId);
    }

    // VER TODAS LAS COMPRAS DE UN CLIENTE
    @GetMapping("/usuario/{usuarioId}")
    public List<Venta> listarPorUsuario(@PathVariable Integer usuarioId) {
        return ventaService.listarPorUsuario(usuarioId);
    }
}
