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
public class CompraService {

    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;

    @Transactional
    public Compra registrarCompra(Compra compra) {
        
        // 1. SEGURIDAD: Evitar sobreescrituras
        compra.setId(null);

        // 2. VALIDACIÓN: Que no manden compras vacías
        if (compra.getDetalles() == null || compra.getDetalles().isEmpty()) {
            throw new RuntimeException("La compra debe contener al menos un producto");
        }

        BigDecimal total = BigDecimal.ZERO;

        for (DetalleCompra detalle : compra.getDetalles()) {

            Producto producto = productoRepository
                    .findById(detalle.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            // 3. SUMAR STOCK
            producto.setStockActual(producto.getStockActual() + detalle.getCantidad());
            productoRepository.save(producto);

            // 4. MATEMÁTICAS: Calcular el subtotal de este renglón (Precio Unitario de Compra x Cantidad)
            // Nota: Aquí SÍ confiamos en el precio del JSON porque el proveedor nos puede cambiar el precio de costo.
            BigDecimal subtotal = detalle.getCostoUnitario().multiply(BigDecimal.valueOf(detalle.getCantidad()));
            detalle.setSubtotal(subtotal);

            // Relacionar el detalle con la compra
            detalle.setCompra(compra);

            // 5. Acumular el total
            total = total.add(subtotal);
        }

        // 6. Guardar el total calculado en la compra principal
        compra.setTotalCompra(total);

        return compraRepository.save(compra);
    }

    // MÉTODOS DE LECTURA (GET)
    public Compra buscarPorId(Integer id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada"));
    }

    public List<Compra> listarPorEmpresa(Integer empresaId) {
        return compraRepository.findByEmpresaId(empresaId);
    }
}