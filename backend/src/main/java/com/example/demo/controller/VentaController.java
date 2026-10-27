package com.example.demo.controller;

import com.example.demo.dto.PageResponse;
import com.example.demo.model.Venta;
import com.example.demo.service.JwtService;
import com.example.demo.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

        if (jwtService.esSupremo(token)) {
            return ventaService.listarTodas();
        }

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return ventaService.listarPorEmpresa(empresaId);
    }

    @GetMapping("/paginado")
    public PageResponse<Venta> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestHeader("Authorization") String token) {

        String rol = jwtService.obtenerRolDeToken(token);
        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));

        return PageResponse.of(ventaService.listarPaginado(empresaId, rol, desde, hasta, pageable));
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Venta> listarPorUsuario(@PathVariable Integer usuarioId,
                                        @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return ventaService.listarPorUsuarioSeguro(usuarioId, empresaId);
    }

    @PostMapping("/{id}/cobrar")
    public Venta cobrar(@PathVariable Integer id,
                        @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return ventaService.marcarCobrada(id, empresaId);
    }

    @PostMapping("/{id}/cancelar")
    public Venta cancelar(@PathVariable Integer id,
                          @RequestHeader("Authorization") String token) {

        Integer empresaId = jwtService.obtenerEmpresaIdDeToken(token);
        return ventaService.cancelarVenta(id, empresaId);
    }
}
