package com.example.demo.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.model.ContenidoPagina;
import com.example.demo.model.Empresa;
import com.example.demo.repository.ContenidoPaginaRepository;
import com.example.demo.repository.EmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContenidoService {

    private final ContenidoPaginaRepository contenidoPaginaRepository;
    private final EmpresaRepository empresaRepository;

    public List<ContenidoPagina> listarPorEmpresa(Integer empresaId) {
        return contenidoPaginaRepository.findByEmpresaId(empresaId);
    }

    public List<ContenidoPagina> listarPorVista(Integer empresaId, String vista) {
        return contenidoPaginaRepository.findByEmpresaIdAndVistaAndActivoTrue(empresaId, vista);
    }

    public Map<String, String> obtenerVista(Integer empresaId, String vista) {
        Map<String, String> resultado = new HashMap<>();
        for (ContenidoPagina c : listarPorVista(empresaId, vista)) {
            resultado.put(c.getClave(), c.getValorTexto());
        }
        return resultado;
    }

    public String obtenerClave(Integer empresaId, String vista, String clave) {
        return contenidoPaginaRepository
                .findByEmpresaIdAndVistaAndClave(empresaId, vista, clave)
                .map(ContenidoPagina::getValorTexto)
                .orElse("");
    }

    public ContenidoPagina crear(Integer empresaId, ContenidoPagina contenido) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada"));

        contenidoPaginaRepository.findByEmpresaIdAndVistaAndClave(
                        empresaId, contenido.getVista(), contenido.getClave())
                .ifPresent(c -> {
                    throw new RuntimeException("Ya existe contenido para esa vista y clave");
                });

        contenido.setId(null);
        contenido.setEmpresa(empresa);
        if (contenido.getActivo() == null) {
            contenido.setActivo(true);
        }
        return contenidoPaginaRepository.save(contenido);
    }

    public ContenidoPagina actualizar(Integer id, Integer empresaId, ContenidoPagina actualizado) {
        return contenidoPaginaRepository.findByIdAndEmpresaId(id, empresaId)
                .map(existente -> {
                    if (actualizado.getValorTexto() != null) existente.setValorTexto(actualizado.getValorTexto());
                    if (actualizado.getImagenUrl() != null) existente.setImagenUrl(actualizado.getImagenUrl());
                    if (actualizado.getActivo() != null) existente.setActivo(actualizado.getActivo());
                    return contenidoPaginaRepository.save(existente);
                })
                .orElseThrow(() -> new NotFoundException("Contenido no encontrado"));
    }

    public void eliminar(Integer id, Integer empresaId) {
        ContenidoPagina contenido = contenidoPaginaRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new NotFoundException("Contenido no encontrado"));
        contenidoPaginaRepository.delete(contenido);
    }
}
