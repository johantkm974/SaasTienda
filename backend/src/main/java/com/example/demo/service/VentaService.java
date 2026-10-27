package com.example.demo.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.exception.StockInsuficienteException;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    @Transactional
    public Venta registrarVenta(Venta venta, Integer empresaId) {

        venta.setId(null);

        if (venta.getDetalles() == null || venta.getDetalles().isEmpty()) {
            throw new RuntimeException("La venta debe contener al menos un producto");
        }

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada"));

        venta.setEmpresa(empresa);

        if (venta.getUsuario() != null && venta.getUsuario().getId() != null) {
            usuarioRepository.findByIdAndEmpresaId(venta.getUsuario().getId(), empresaId)
                    .orElseThrow(() -> new NotFoundException("El cliente no pertenece a su empresa"));
        } else {
            venta.setUsuario(null);
        }

        BigDecimal total = BigDecimal.ZERO;

        for (DetalleVenta detalle : venta.getDetalles()) {

            if (detalle.getProducto() == null || detalle.getProducto().getId() == null) {
                throw new RuntimeException("Producto inválido en la venta");
            }

            if (detalle.getCantidad() == null || detalle.getCantidad() <= 0) {
                throw new RuntimeException("La cantidad debe ser mayor a cero");
            }

            Producto producto = productoRepository
                    .findByIdAndEmpresaId(detalle.getProducto().getId(), empresaId)
                    .orElseThrow(() ->
                            new NotFoundException("Producto no pertenece a su empresa"));

            int filasActualizadas = productoRepository.decrementarStock(
                    producto.getId(), empresaId, detalle.getCantidad());

            if (filasActualizadas == 0) {
                throw new StockInsuficienteException("Stock insuficiente para " + producto.getNombre());
            }

            BigDecimal precioReal = producto.getPrecioVenta();
            detalle.setPrecioUnitario(precioReal);

            BigDecimal subtotal = precioReal.multiply(
                    BigDecimal.valueOf(detalle.getCantidad()));

            detalle.setSubtotal(subtotal);
            detalle.setVenta(venta);

            total = total.add(subtotal);
        }

        venta.setTotalVenta(total);

        if ("PAGADO".equalsIgnoreCase(venta.getEstadoPago())) {
            venta.setEstadoVenta("PAGADA");
        }

        return ventaRepository.save(venta);
    }

    public Venta buscarPorIdSeguro(Integer id, Integer empresaId) {

        return ventaRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() ->
                        new NotFoundException("Venta no encontrada en su empresa"));
    }

    public List<Venta> listarPorEmpresa(Integer empresaId) {
        return ventaRepository.findByEmpresaId(empresaId);
    }

    public List<Venta> listarTodas() {
        return ventaRepository.findAll();
    }

    public List<Venta> listarPorUsuarioSeguro(Integer usuarioId,
                                              Integer empresaId) {

        return ventaRepository
                .findByUsuarioIdAndEmpresaId(usuarioId, empresaId);
    }

    public Page<Venta> listarPaginado(Integer empresaId, String rol,
                                      LocalDate desde, LocalDate hasta,
                                      Pageable pageable) {

        if (desde != null && hasta != null) {
            if (hasta.isBefore(desde)) {
                throw new RuntimeException("hasta no puede ser menor que desde");
            }
        }

        LocalDateTime desdeDateTime = desde != null ? desde.atStartOfDay() : null;
        LocalDateTime hastaDateTime = hasta != null ? hasta.plusDays(1).atStartOfDay().minusNanos(1) : null;

        boolean esSupremo = "SUPREMO".equalsIgnoreCase(rol);

        if (esSupremo) {
            if (desdeDateTime != null && hastaDateTime != null) {
                return ventaRepository.findByFechaBetween(desdeDateTime, hastaDateTime, pageable);
            }
            return ventaRepository.findAll(pageable);
        }

        if (desdeDateTime != null && hastaDateTime != null) {
            return ventaRepository.findByEmpresaIdAndFechaBetween(empresaId, desdeDateTime, hastaDateTime, pageable);
        }
        return ventaRepository.findByEmpresaId(empresaId, pageable);
    }

    public boolean esSupremo(String token) {
        return jwtService.esSupremo(token);
    }

    @Transactional
    public Venta marcarCobrada(Integer ventaId, Integer empresaId) {
        Venta venta = buscarPorIdSeguro(ventaId, empresaId);
        if (!"PENDIENTE_COBRO".equals(venta.getEstadoPago())) {
            throw new RuntimeException("Solo se puede cobrar una venta pendiente de cobro");
        }
        venta.setEstadoPago("PAGADO");
        venta.setEstadoVenta("PAGADA");
        return ventaRepository.save(venta);
    }

    @Transactional
    public Venta cancelarVenta(Integer ventaId, Integer empresaId) {
        Venta venta = buscarPorIdSeguro(ventaId, empresaId);
        if ("PAGADO".equals(venta.getEstadoPago()) || "APROBADO".equals(venta.getEstadoPago())) {
            throw new RuntimeException("No se puede cancelar una venta ya pagada");
        }
        if (Boolean.TRUE.equals(venta.getStockReservado())) {
            for (DetalleVenta detalle : venta.getDetalles()) {
                productoRepository.incrementarStock(
                        detalle.getProducto().getId(), empresaId, detalle.getCantidad());
            }
            venta.setStockReservado(false);
        }
        venta.setEstadoPago("CANCELADO");
        venta.setEstadoVenta("CANCELADA");
        return ventaRepository.save(venta);
    }
}
