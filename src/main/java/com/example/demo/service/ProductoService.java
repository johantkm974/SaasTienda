package com.example.demo.service;

import com.example.demo.model.Producto;
import com.example.demo.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    public Producto guardar(Producto producto) {

        if (producto.getPrecioVenta().doubleValue() < 0) {
            throw new RuntimeException("El precio no puede ser negativo");
        }

        return productoRepository.save(producto);
    }

    public List<Producto> listarPorEmpresa(Integer empresaId) {
        return productoRepository.findByEmpresaId(empresaId);
    }
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    public Producto buscarPorIdYEmpresa(Integer id, Integer empresaId) {
        return productoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }
    public void eliminar(Integer id){
        if (!productoRepository.existsById(id)){
            throw new RuntimeException("Nos puede eliminar, el producto no existe");
        }
        productoRepository.deleteById(id);

    }
}
