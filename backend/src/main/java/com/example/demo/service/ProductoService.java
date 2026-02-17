package com.example.demo.service;

import com.example.demo.model.Producto;
import com.example.demo.repository.ProductoRepository;
import com.example.demo.repository.EmpresaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final EmpresaRepository empresaRepository;

    public List<Producto> listarPorEmpresa(Integer empresaId) {
        return productoRepository.findByEmpresaId(empresaId);
    }

    public Producto buscarPorIdYEmpresa(Integer id, Integer empresaId) {
        return productoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado en su bodega"));
    }

    public Producto crearConEmpresa(Producto producto, Integer empresaId) {
        var empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        producto.setEmpresa(empresa);
        return productoRepository.save(producto);
    }

    public Producto actualizarSeguro(Integer id, Producto actualizado, Integer empresaId) {
        return productoRepository.findByIdAndEmpresaId(id, empresaId).map(existente -> {
            existente.setNombre(actualizado.getNombre());
            existente.setPrecioVenta(actualizado.getPrecioVenta());
            existente.setStockActual(actualizado.getStockActual());
            return productoRepository.save(existente);
        }).orElseThrow(() -> new RuntimeException("No se pudo actualizar: el producto no existe en su bodega"));
    }

    public void eliminarSeguro(Integer id, Integer empresaId) {
        Producto producto = productoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new RuntimeException("No se pudo eliminar: el producto no existe en su bodega"));
        productoRepository.delete(producto);
    }
}