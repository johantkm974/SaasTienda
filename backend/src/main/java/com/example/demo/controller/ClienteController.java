package com.example.demo.controller;

import com.example.demo.model.Cliente;
import com.example.demo.service.ClienteService;
import com.example.demo.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;
    private final JwtService jwtService;

    @GetMapping
    public List<Cliente> listar(@RequestHeader("Authorization") String token) {
        return clienteService.listarPorEmpresa(jwtService.obtenerEmpresaIdDeToken(token));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Cliente crear(@RequestBody Cliente cliente,
                         @RequestHeader("Authorization") String token) {
        return clienteService.registrar(jwtService.obtenerEmpresaIdDeToken(token), cliente);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Cliente actualizar(@PathVariable Integer id,
                              @RequestBody Cliente cliente,
                              @RequestHeader("Authorization") String token) {
        return clienteService.actualizar(id, jwtService.obtenerEmpresaIdDeToken(token), cliente);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void eliminar(@PathVariable Integer id,
                         @RequestHeader("Authorization") String token) {
        clienteService.eliminar(id, jwtService.obtenerEmpresaIdDeToken(token));
    }
}
