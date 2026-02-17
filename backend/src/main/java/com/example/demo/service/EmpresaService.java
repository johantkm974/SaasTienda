package com.example.demo.service;

import com.example.demo.model.Empresa;
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
            empresaExistente.setEstado(empresaActualizada.getEstado());
            empresaExistente.setLogoUrl(empresaActualizada.getLogoUrl());
            empresaExistente.setTelefono(empresaActualizada.getTelefono());

            return empresaRepository.save(empresaExistente);
        }).orElseThrow(()->new RuntimeException("Empresa no encontrada con el ID" +id));
    }

    public List<Empresa> listar() {
        return empresaRepository.findAll();
    }

    public Empresa buscarPorId(Integer id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
    }
    public void eliminar(Integer id){
        if(!empresaRepository.existsById(id)){
            throw new RuntimeException("No se puede eliminar la empresa no existe");
        }
        empresaRepository.deleteById(id);
    }
}
