package com.example.demo.service;

import com.example.demo.model.Proveedor;
import com.example.demo.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public Proveedor guardar(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    public List<Proveedor> listarPorEmpresa(Integer empresaId) {
        return proveedorRepository.findByEmpresaId(empresaId);
    }
}

