package com.example.demo.service;

import com.example.demo.model.*;
import com.example.demo.exception.NotFoundException;
import com.example.demo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompraService {

    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;
    private final EmpresaRepository empresaRepository;
    private final ProveedorRepository proveedorRepository;

    @Transactional
    public Compra registrarCompra(Compra compra, Integer empresaId) {

        compra.setId(null);

        if (compra.getDetalles() == null || compra.getDetalles().isEmpty()) {
            throw new RuntimeException("La compra debe contener al menos un producto");
        }

        if (compra.getProveedor() == null || compra.getProveedor().getId() == null) {
            throw new RuntimeException("Debe seleccionar un proveedor");
        }

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada"));

        proveedorRepository.findByIdAndEmpresaId(compra.getProveedor().getId(), empresaId)
                .orElseThrow(() -> new NotFoundException("El proveedor no pertenece a su empresa"));

        compra.setEmpresa(empresa);

        BigDecimal total = BigDecimal.ZERO;

        for (DetalleCompra detalle : compra.getDetalles()) {

            if (detalle.getProducto() == null || detalle.getProducto().getId() == null) {
                throw new RuntimeException("Producto inválido en la compra");
            }

            if (detalle.getCantidad() == null || detalle.getCantidad() <= 0) {
                throw new RuntimeException("La cantidad debe ser mayor a cero");
            }

            if (detalle.getCostoUnitario() == null) {
                throw new RuntimeException("El costo unitario es obligatorio");
            }

            Producto producto = productoRepository
                    .findByIdAndEmpresaId(detalle.getProducto().getId(), empresaId)
                    .orElseThrow(() -> new NotFoundException("Producto no pertenece a su empresa"));

            productoRepository.incrementarStock(producto.getId(), empresaId, detalle.getCantidad());

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
                .orElseThrow(() -> new NotFoundException("Compra no encontrada en su empresa"));
    }

    public List<Compra> listarPorEmpresa(Integer empresaId) {
        return compraRepository.findByEmpresaId(empresaId);
    }
}
