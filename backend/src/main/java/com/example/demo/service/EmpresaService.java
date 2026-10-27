package com.example.demo.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.model.Empresa;
import com.example.demo.model.EstadoEmpresa;
import com.example.demo.repository.EmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public Empresa registrar(Empresa empresa) {
        empresa.setId(null);
        empresaRepository.findByRuc(empresa.getRuc())
                .ifPresent(e -> {
                    throw new RuntimeException("Ya existe una empresa con ese RUC");
                });

        return empresaRepository.save(empresa);
    }
    public Empresa actualizar(Integer id, Empresa empresaActualizada){
        return empresaRepository.findById(id).map(empresaExistente ->{

            if (!empresaExistente.getRuc().equals(empresaActualizada.getRuc())){
                empresaRepository.findByRuc(empresaActualizada.getRuc())
                    .ifPresent(e-> {
                        throw new RuntimeException("Ya existe otra empresa usando es nuevo Ruc");
                    });
            }
            empresaExistente.setNombreComercial(empresaActualizada.getNombreComercial());
            empresaExistente.setRuc(empresaActualizada.getRuc());
            if (empresaActualizada.getEstado() != null) {
                empresaExistente.setEstado(empresaActualizada.getEstado());
            }
            if (empresaActualizada.getLogoUrl() != null) {
                empresaExistente.setLogoUrl(empresaActualizada.getLogoUrl());
            }
            if (empresaActualizada.getTelefono() != null) {
                empresaExistente.setTelefono(empresaActualizada.getTelefono());
            }
            if (empresaActualizada.getSlogan() != null) {
                empresaExistente.setSlogan(empresaActualizada.getSlogan());
            }
            if (empresaActualizada.getColorPrimario() != null) {
                empresaExistente.setColorPrimario(empresaActualizada.getColorPrimario());
            }
            if (empresaActualizada.getBannerUrl() != null) {
                empresaExistente.setBannerUrl(empresaActualizada.getBannerUrl());
            }
            if (empresaActualizada.getMostrarStock() != null) {
                empresaExistente.setMostrarStock(empresaActualizada.getMostrarStock());
            }
            if (empresaActualizada.getCostoEnvio() != null) {
                empresaExistente.setCostoEnvio(empresaActualizada.getCostoEnvio());
            }
            if (empresaActualizada.getEnvioGratisDesde() != null) {
                empresaExistente.setEnvioGratisDesde(empresaActualizada.getEnvioGratisDesde());
            }
            if (empresaActualizada.getContraEntrega() != null) {
                empresaExistente.setContraEntrega(empresaActualizada.getContraEntrega());
            }
            if (empresaActualizada.getContraEntregaMaximo() != null) {
                empresaExistente.setContraEntregaMaximo(empresaActualizada.getContraEntregaMaximo());
            }

            return empresaRepository.save(empresaExistente);
        }).orElseThrow(()->new RuntimeException("Empresa no encontrada con el ID" +id));
    }

    public Empresa cambiarEstado(Integer id, EstadoEmpresa estado) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada con el ID " + id));
        empresa.setEstado(estado);
        return empresaRepository.save(empresa);
    }

    public List<Empresa> listar() {
        return empresaRepository.findAll();
    }

    public Empresa buscarPorId(Integer id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada"));
    }
    public void eliminar(Integer id){
        if(!empresaRepository.existsById(id)){
            throw new NotFoundException("No se puede eliminar la empresa no existe");
        }
        empresaRepository.deleteById(id);
    }
}
