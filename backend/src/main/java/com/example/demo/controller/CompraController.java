package com.example.demo.controller;

import com.example.demo.model.Compra;
import com.example.demo.service.CompraService;
import com.example.demo.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;
    private final JwtService jwtService;

    @PostMapping
    public Compra registrar(@RequestBody Compra compra,
                             @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return compraService.registrarCompra(compra, empresaId);
    }

    @GetMapping
    public List<Compra> listar(@RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return compraService.listarPorEmpresa(empresaId);
    }

    @GetMapping("/{id}")
    public Compra buscar(@PathVariable Integer id,
                         @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return compraService.buscarPorIdSeguro(id, empresaId);
    }
}
