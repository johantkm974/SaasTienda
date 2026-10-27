package com.example.demo.controller;

import com.example.demo.model.Banner;
import com.example.demo.model.ContenidoPagina;
import com.example.demo.service.BannerService;
import com.example.demo.service.ContenidoService;
import com.example.demo.service.JwtService;
import com.example.demo.service.TiendaContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contenido")
@RequiredArgsConstructor
public class ContenidoController {

    private final ContenidoService contenidoService;
    private final BannerService bannerService;
    private final TiendaContext tiendaContext;
    private final JwtService jwtService;

    @GetMapping("/banners")
    public List<Banner> obtenerBanners(@RequestParam(defaultValue = "home") String pagina) {
        return bannerService.listarPublicos(tiendaContext.empresaIdActual(), pagina);
    }

    @GetMapping("/{vista}")
    public Map<String, String> obtenerContenido(@PathVariable String vista) {
        return contenidoService.obtenerVista(tiendaContext.empresaIdActual(), vista);
    }

    @GetMapping("/{vista}/{clave}")
    public String obtenerContenidoClave(@PathVariable String vista,
                                        @PathVariable String clave) {
        return contenidoService.obtenerClave(tiendaContext.empresaIdActual(), vista, clave);
    }

    @GetMapping
    public List<ContenidoPagina> listar(@RequestHeader("Authorization") String token) {
        return contenidoService.listarPorEmpresa(jwtService.obtenerEmpresaIdDeToken(token));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ContenidoPagina crear(@RequestBody ContenidoPagina contenido,
                                 @RequestHeader("Authorization") String token) {
        return contenidoService.crear(jwtService.obtenerEmpresaIdDeToken(token), contenido);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ContenidoPagina actualizar(@PathVariable Integer id,
                                      @RequestBody ContenidoPagina contenido,
                                      @RequestHeader("Authorization") String token) {
        return contenidoService.actualizar(id, jwtService.obtenerEmpresaIdDeToken(token), contenido);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void eliminar(@PathVariable Integer id,
                         @RequestHeader("Authorization") String token) {
        contenidoService.eliminar(id, jwtService.obtenerEmpresaIdDeToken(token));
    }
}
