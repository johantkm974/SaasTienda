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
        empresaRepository.findByRuc(empresa.getRuc())
                .ifPresent(e -> {
                    throw new RuntimeException("Ya existe una empresa con ese RUC");
                });

        return empresaRepository.save(empresa);
    }

    public List<Empresa> listar() {
        return empresaRepository.findAll();
    }

    public Empresa buscarPorId(Integer id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
    }
}
