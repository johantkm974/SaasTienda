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
    private final EmpresaRepository empresaRepository;

    @Transactional
    public Venta registrarVenta(Venta venta, Integer empresaId) {

        venta.setId(null);

        if (venta.getDetalles() == null || venta.getDetalles().isEmpty()) {
            throw new RuntimeException("La venta debe contener al menos un producto");
        }

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        venta.setEmpresa(empresa);

        BigDecimal total = BigDecimal.ZERO;

        for (DetalleVenta detalle : venta.getDetalles()) {

            Producto producto = productoRepository
                    .findByIdAndEmpresaId(detalle.getProducto().getId(), empresaId)
                    .orElseThrow(() ->
                            new RuntimeException("Producto no pertenece a su empresa"));

            if (producto.getStockActual() < detalle.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para " + producto.getNombre());
            }

            producto.setStockActual(producto.getStockActual() - detalle.getCantidad());
            productoRepository.save(producto);

            BigDecimal precioReal = producto.getPrecioVenta();
            detalle.setPrecioUnitario(precioReal);

            BigDecimal subtotal = precioReal.multiply(
                    BigDecimal.valueOf(detalle.getCantidad()));

            detalle.setSubtotal(subtotal);
            detalle.setVenta(venta);

            total = total.add(subtotal);
        }

        venta.setTotalVenta(total);

        return ventaRepository.save(venta);
    }

    public Venta buscarPorIdSeguro(Integer id, Integer empresaId) {

        return ventaRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() ->
                        new RuntimeException("Venta no encontrada en su empresa"));
    }

    public List<Venta> listarPorEmpresa(Integer empresaId) {
        return ventaRepository.findByEmpresaId(empresaId);
    }

    public List<Venta> listarPorUsuarioSeguro(Integer usuarioId,
                                              Integer empresaId) {

        return ventaRepository
                .findByUsuarioIdAndEmpresaId(usuarioId, empresaId);
    }
}
