package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;

    @Transactional
    public Venta registrarVenta(Venta venta) {
        
        // 1. SEGURIDAD: Evitar sobreescritura de ventas
        venta.setId(null);

        // 2. VALIDACIÓN: Que no manden ventas sin detalles
        if (venta.getDetalles() == null || venta.getDetalles().isEmpty()) {
            throw new RuntimeException("La venta debe contener al menos un producto");
        }

        BigDecimal total = BigDecimal.ZERO;

        for (DetalleVenta detalle : venta.getDetalles()) {

            Producto producto = productoRepository
                    .findById(detalle.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (producto.getStockActual() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para " + producto.getNombre());
            }

            // RESTAR STOCK
            producto.setStockActual(producto.getStockActual() - detalle.getCantidad());
            productoRepository.save(producto);

            // 3. SEGURIDAD: Usar el precio REAL de la base de datos, no el del JSON
            BigDecimal precioReal = producto.getPrecioVenta();
            detalle.setPrecioUnitario(precioReal);

            // Calcular subtotal con el precio real
            BigDecimal subtotal = precioReal.multiply(BigDecimal.valueOf(detalle.getCantidad()));

            detalle.setSubtotal(subtotal);
            
            // Relacionar este detalle con la venta padre
            detalle.setVenta(venta);

            total = total.add(subtotal);
        }

        venta.setTotalVenta(total);

        return ventaRepository.save(venta);
    }
    public Venta buscarPorId(Integer id) {
        return ventaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con el ID: " + id));
    }

    // 2. Historial de ventas de una empresa
    public List<Venta> listarPorEmpresa(Integer empresaId) {
        return ventaRepository.findByEmpresaId(empresaId);
    }

    // 3. Historial de compras de un cliente (Usuario)
    public List<Venta> listarPorUsuario(Integer usuarioId) {
        return ventaRepository.findByUsuarioId(usuarioId);
    }
}
