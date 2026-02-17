package com.example.demo.controller;

import com.example.demo.model.Compra;
import com.example.demo.service.CompraService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @PostMapping
    public Compra registrar(@RequestBody Compra compra) {
        return compraService.registrarCompra(compra);
    }
}
