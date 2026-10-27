package com.example.demo.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.model.Producto;
import com.example.demo.repository.ProductoRepository;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.CategoriaRepository;
import com.example.demo.repository.DetalleCompraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final EmpresaRepository empresaRepository;
    private final CategoriaRepository categoriaRepository;
    private final DetalleCompraRepository detalleCompraRepository;

    public List<Producto> listarPorEmpresa(Integer empresaId) {

        List<Producto> productos = productoRepository.findByEmpresaId(empresaId);

        for (Producto producto : productos) {
            detalleCompraRepository
                    .findTopByProductoIdOrderByIdDesc(producto.getId())
                    .ifPresent(detalle ->
                            producto.setCostoUnitario(detalle.getCostoUnitario())
                    );
        }

        return productos;
    }

    public Producto buscarPorIdYEmpresa(Integer id, Integer empresaId) {

        Producto producto = productoRepository
                .findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() ->
                        new NotFoundException("Producto no encontrado en su bodega"));

        detalleCompraRepository
                .findTopByProductoIdOrderByIdDesc(producto.getId())
                .ifPresent(detalle ->
                        producto.setCostoUnitario(detalle.getCostoUnitario())
                );

        return producto;
    }

    public Producto crearConEmpresa(Producto producto, Integer empresaId) {

        producto.setId(null);

        var empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() ->
                        new NotFoundException("Empresa no encontrada"));

        producto.setEmpresa(empresa);

        if (producto.getCategoria() != null && producto.getCategoria().getId() != null) {
            categoriaRepository
                    .findByIdAndEmpresaId(producto.getCategoria().getId(), empresaId)
                    .orElseThrow(() ->
                            new RuntimeException("La categorÃ­a no pertenece a su empresa"));
        } else {
            producto.setCategoria(null);
        }

        if (producto.getStockMinimo() == null) {
            producto.setStockMinimo(5);
        }

        return productoRepository.save(producto);
    }

    public Producto actualizarSeguro(Integer id, Producto actualizado, Integer empresaId) {

        return productoRepository
                .findByIdAndEmpresaId(id, empresaId)
                .map(existente -> {

                    existente.setNombre(actualizado.getNombre());
                    existente.setDescripcion(actualizado.getDescripcion());
                    existente.setPrecioVenta(actualizado.getPrecioVenta());
                    existente.setMarca(actualizado.getMarca());
                    existente.setCodigoSku(actualizado.getCodigoSku());
                    existente.setImagenUrl(actualizado.getImagenUrl());

                    if (actualizado.getCategoria() != null && actualizado.getCategoria().getId() != null) {
                        categoriaRepository
                                .findByIdAndEmpresaId(actualizado.getCategoria().getId(), empresaId)
                                .orElseThrow(() ->
                                        new RuntimeException("La categorÃ­a no pertenece a su empresa"));
                        existente.setCategoria(actualizado.getCategoria());
                    }

                    if (actualizado.getStockMinimo() != null) {
                        existente.setStockMinimo(actualizado.getStockMinimo());
                    }

                    if (actualizado.getDestacado() != null) {
                        existente.setDestacado(actualizado.getDestacado());
                    }

                    return productoRepository.save(existente);
                })
                .orElseThrow(() ->
                        new NotFoundException("No se pudo actualizar: el producto no existe en su bodega"));
    }

    public void eliminarSeguro(Integer id, Integer empresaId) {

        Producto producto = productoRepository
                .findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() ->
                        new NotFoundException("No se pudo eliminar: el producto no existe en su bodega"));

        productoRepository.delete(producto);
    }

    public boolean estaEnStockCritico(Producto producto) {
        return producto.getStockActual() <= producto.getStockMinimo();
    }
}
