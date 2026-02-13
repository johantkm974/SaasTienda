package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;

    @Transactional
    public Venta registrarVenta(Venta venta) {

        BigDecimal total = BigDecimal.ZERO;

        for (DetalleVenta detalle : venta.getDetalles()) {

            Producto producto = productoRepository
                    .findById(detalle.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (producto.getStockActual() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para " + producto.getNombre());
            }

            // RESTAR STOCK
            producto.setStockActual(
                    producto.getStockActual() - detalle.getCantidad()
            );

            productoRepository.save(producto);

            // Calcular subtotal
            BigDecimal subtotal = detalle.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));

            detalle.setSubtotal(subtotal);
            detalle.setVenta(venta);

            total = total.add(subtotal);
        }

        venta.setTotalVenta(total);

        return ventaRepository.save(venta);
    }
}
