package com.example.demo.controller;

import com.example.demo.model.Banner;
import com.example.demo.service.BannerService;
import com.example.demo.service.CloudinaryService;
import com.example.demo.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;
    private final CloudinaryService cloudinaryService;
    private final JwtService jwtService;

    @GetMapping
    public List<Banner> listar(@RequestHeader("Authorization") String token) {
        return bannerService.listarPorEmpresa(jwtService.obtenerEmpresaIdDeToken(token));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Banner crear(@RequestBody Banner banner,
                        @RequestHeader("Authorization") String token) {
        return bannerService.crear(jwtService.obtenerEmpresaIdDeToken(token), banner);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Banner actualizar(@PathVariable Integer id,
                             @RequestBody Banner banner,
                             @RequestHeader("Authorization") String token) {
        return bannerService.actualizar(id, jwtService.obtenerEmpresaIdDeToken(token), banner);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void eliminar(@PathVariable Integer id,
                         @RequestHeader("Authorization") String token) {
        bannerService.eliminar(id, jwtService.obtenerEmpresaIdDeToken(token));
    }

    @PostMapping("/imagen")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Map<String, String> subirImagen(@RequestBody Map<String, String> body,
                                           @RequestHeader("Authorization") String token) {
        String url = cloudinaryService.subirBase64(
                jwtService.obtenerEmpresaIdDeToken(token), body.get("imagenBase64"));
        return Map.of("imagenUrl", url);
    }
}
