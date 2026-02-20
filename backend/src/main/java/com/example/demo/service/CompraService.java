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
    private final EmpresaRepository empresaRepository;

    @Transactional
    public Compra registrarCompra(Compra compra, Integer empresaId) {

        compra.setId(null);

        if (compra.getDetalles() == null || compra.getDetalles().isEmpty()) {
            throw new RuntimeException("La compra debe contener al menos un producto");
        }

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        compra.setEmpresa(empresa);

        BigDecimal total = BigDecimal.ZERO;

        for (DetalleCompra detalle : compra.getDetalles()) {

            Producto producto = productoRepository
                    .findByIdAndEmpresaId(detalle.getProducto().getId(), empresaId)
                    .orElseThrow(() -> new RuntimeException("Producto no pertenece a su empresa"));

            // SUMAR STOCK
            producto.setStockActual(producto.getStockActual() + detalle.getCantidad());
            productoRepository.save(producto);

            // CALCULAR SUBTOTAL
            BigDecimal subtotal = detalle.getCostoUnitario()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()));

            detalle.setSubtotal(subtotal);
            detalle.setCompra(compra);

            total = total.add(subtotal);
        }

        compra.setTotalCompra(total);

        return compraRepository.save(compra);
    }

    public Compra buscarPorIdSeguro(Integer id, Integer empresaId) {
        return compraRepository
                .findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new RuntimeException("Compra no encontrada en su empresa"));
    }

    public List<Compra> listarPorEmpresa(Integer empresaId) {
        return compraRepository.findByEmpresaId(empresaId);
    }
}
