package com.example.demo.service;

import com.example.demo.model.Empresa;
import com.example.demo.model.Proveedor;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final EmpresaRepository empresaRepository;

    public Proveedor crearSeguro(Proveedor proveedor, Integer empresaId) {

        proveedor.setId(null);

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        proveedor.setEmpresa(empresa);

        return proveedorRepository.save(proveedor);
    }

    public Proveedor actualizarSeguro(Integer id,
                                      Proveedor proveedorActualizado,
                                      Integer empresaId) {

        return proveedorRepository.findByIdAndEmpresaId(id, empresaId)
                .map(proveedorExistente -> {

                    proveedorExistente.setNombre(proveedorActualizado.getNombre());
                    proveedorExistente.setIdentificacion(proveedorActualizado.getIdentificacion());
                    proveedorExistente.setTelefono(proveedorActualizado.getTelefono());
                    proveedorExistente.setCorreo(proveedorActualizado.getCorreo());

                    return proveedorRepository.save(proveedorExistente);

                }).orElseThrow(() ->
                        new RuntimeException("Proveedor no pertenece a su empresa"));
    }

    public List<Proveedor> listarPorEmpresa(Integer empresaId) {
        return proveedorRepository.findByEmpresaId(empresaId);
    }

    public Proveedor buscarPorIdSeguro(Integer id, Integer empresaId) {

        return proveedorRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() ->
                        new RuntimeException("Proveedor no encontrado en su empresa"));
    }

    public void eliminarSeguro(Integer id, Integer empresaId) {

        Proveedor proveedor = proveedorRepository
                .findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() ->
                        new RuntimeException("Proveedor no pertenece a su empresa"));

        proveedorRepository.delete(proveedor);
    }
}
