package com.example.demo.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.model.Banner;
import com.example.demo.model.Empresa;
import com.example.demo.repository.BannerRepository;
import com.example.demo.repository.EmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;
    private final EmpresaRepository empresaRepository;

    public List<Banner> listarPorEmpresa(Integer empresaId) {
        return bannerRepository.findByEmpresaIdOrderByOrdenAsc(empresaId);
    }

    public List<Banner> listarPublicos(Integer empresaId, String pagina) {
        return bannerRepository.findByEmpresaIdAndPaginaAndActivoTrueOrderByOrdenAsc(empresaId, pagina);
    }

    public Banner crear(Integer empresaId, Banner banner) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada"));
        banner.setId(null);
        banner.setEmpresa(empresa);
        if (banner.getPagina() == null) {
            banner.setPagina("tienda");
        }
        if (banner.getActivo() == null) {
            banner.setActivo(true);
        }
        return bannerRepository.save(banner);
    }

    public Banner actualizar(Integer id, Integer empresaId, Banner actualizado) {
        return bannerRepository.findByIdAndEmpresaId(id, empresaId)
                .map(existente -> {
                    if (actualizado.getTitulo() != null) existente.setTitulo(actualizado.getTitulo());
                    if (actualizado.getSubtitulo() != null) existente.setSubtitulo(actualizado.getSubtitulo());
                    if (actualizado.getDescripcion() != null) existente.setDescripcion(actualizado.getDescripcion());
                    if (actualizado.getImagenUrl() != null) existente.setImagenUrl(actualizado.getImagenUrl());
                    if (actualizado.getEnlace() != null) existente.setEnlace(actualizado.getEnlace());
                    if (actualizado.getOrden() != null) existente.setOrden(actualizado.getOrden());
                    if (actualizado.getPagina() != null) existente.setPagina(actualizado.getPagina());
                    if (actualizado.getActivo() != null) existente.setActivo(actualizado.getActivo());
                    return bannerRepository.save(existente);
                })
                .orElseThrow(() -> new NotFoundException("Banner no encontrado"));
    }

    public void eliminar(Integer id, Integer empresaId) {
        Banner banner = bannerRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new NotFoundException("Banner no encontrado"));
        bannerRepository.delete(banner);
    }
}
