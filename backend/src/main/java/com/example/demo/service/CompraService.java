package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompraService {

    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;

    @Transactional
    public Compra registrarCompra(Compra compra) {

        compra.getDetalles().forEach(detalle -> {

            Producto producto = productoRepository
                    .findById(detalle.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            // SUMAR STOCK
            producto.setStockActual(
                    producto.getStockActual() + detalle.getCantidad()
            );

            productoRepository.save(producto);

            detalle.setCompra(compra);
        });

        return compraRepository.save(compra);
    }
}
