package com.example.demo.service;

import com.example.demo.dto.TiendaCheckoutItemRequest;
import com.example.demo.dto.TiendaCheckoutRequest;
import com.example.demo.dto.TiendaCheckoutResponse;
import com.example.demo.exception.NotFoundException;
import com.example.demo.exception.StockInsuficienteException;
import com.example.demo.model.*;
import com.example.demo.repository.ClienteRepository;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.ProductoRepository;
import com.example.demo.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TiendaPublicaService {

    private final EmpresaRepository empresaRepository;
    private final ProductoRepository productoRepository;
    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final ClienteService clienteService;
    private final PagoService pagoService;
    private final PayPalService payPalService;

    public Empresa obtenerTienda(Integer empresaId) {
        return empresaRepository.findById(empresaId)
                .filter(e -> e.getEstado() == EstadoEmpresa.ACTIVO)
                .orElseThrow(() -> new NotFoundException("Tienda no encontrada"));
    }

    public List<Producto> listarProductos(Integer empresaId) {
        return productoRepository.findByEmpresaId(empresaId);
    }

    @Transactional
    public TiendaCheckoutResponse checkout(Integer empresaId, TiendaCheckoutRequest request) {
        Empresa empresa = obtenerTienda(empresaId);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        Cliente cliente = resolverCliente(empresaId, request);

        String metodoPago = request.getMetodoPago() != null && !request.getMetodoPago().isBlank()
                ? request.getMetodoPago()
                : (request.isConPago() ? "MERCADO_PAGO" : "CONTADO");

        boolean usaContraEntrega = "CONTADO".equalsIgnoreCase(metodoPago);

        Venta venta = new Venta();
        venta.setEmpresa(empresa);
        venta.setCliente(cliente);
        venta.setMetodoPago(metodoPago);

        List<DetalleVenta> detalles = new ArrayList<>();
        BigDecimal totalProductos = BigDecimal.ZERO;

        for (TiendaCheckoutItemRequest item : request.getItems()) {
            if (item.getProductoId() == null
                    || item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new RuntimeException("Cantidad inválida en el carrito");
            }

            Producto producto = productoRepository.findByIdAndEmpresaId(item.getProductoId(), empresaId)
                    .orElseThrow(() -> new NotFoundException("Producto no disponible"));

            // Reserva atómica del stock: evita la carrera entre dos compras simultáneas
            int filasReservadas = productoRepository.decrementarStock(
                    producto.getId(), empresaId, item.getCantidad());
            if (filasReservadas == 0) {
                throw new StockInsuficienteException("Stock insuficiente para " + producto.getNombre());
            }

            DetalleVenta detalle = new DetalleVenta();
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecioVenta());
            detalle.setSubtotal(producto.getPrecioVenta().multiply(BigDecimal.valueOf(item.getCantidad())));
            detalle.setVenta(venta);
            detalles.add(detalle);
            totalProductos = totalProductos.add(detalle.getSubtotal());
        }

        venta.setDetalles(detalles);
        venta.setStockReservado(true);

        // El costo de envío lo define la empresa (costo_envio / envio_gratis_desde),
        // el valor enviado por el cliente se ignora y se calcula en el backend
        BigDecimal costoEnvio = calcularCostoEnvio(empresa, totalProductos);
        venta.setTotalVenta(totalProductos.add(costoEnvio));

        if (usaContraEntrega) {
            boolean habilitado = Boolean.TRUE.equals(empresa.getContraEntrega());
            boolean dentroDeLimite = empresa.getContraEntregaMaximo() == null
                    || totalProductos.compareTo(empresa.getContraEntregaMaximo()) <= 0;
            if (!habilitado) {
                throw new RuntimeException("El contra entrega no está disponible en esta tienda");
            }
            if (!dentroDeLimite) {
                throw new RuntimeException("El contra entrega solo está disponible para pedidos de hasta "
                        + "S/ " + empresa.getContraEntregaMaximo());
            }
        }

        venta = ventaRepository.save(venta);

        pagoService.crearEnvioSiNoExiste(venta, request.getDireccion(), request.getDistrito(), costoEnvio);

        boolean usaPaypal = request.isConPago() && "PAYPAL".equalsIgnoreCase(metodoPago)
                && payPalService.paypalConfigurado(empresaId);
        boolean conPago = request.isConPago()
                && (pagoService.mercadopagoConfigurado(empresaId) || usaPaypal);
        TiendaCheckoutResponse.TiendaCheckoutResponseBuilder respuesta =
                TiendaCheckoutResponse.builder()
                        .ventaId(venta.getId())
                        .total(venta.getTotalVenta())
                        .costoEnvio(costoEnvio)
                        .conPago(conPago)
                        .metodoPago(metodoPago);

        if (usaPaypal) {
            String paypalUrl = payPalService.crearOrden(empresaId, venta.getId());
            respuesta.paypalUrl(paypalUrl)
                    .estadoPago("PENDIENTE")
                    .estadoVenta("PENDIENTE_PAGO");
        } else if (conPago) {
            pagoService.crearPreferencia(empresaId, venta.getId(), null, null, null);
            Pago pago = pagoService.verificarPorVenta(venta.getId(), empresaId);
            respuesta.estadoPago(pago.getEstado())
                    .estadoVenta(venta.getEstadoVenta())
                    .initPoint(pago.getInitPoint());
        } else {
            // Contra entrega: el stock ya quedó reservado; queda pendiente el cobro
            // hasta que el negocio confirme el pago en el dashboard
            venta.setEstadoPago("PENDIENTE_COBRO");
            venta.setEstadoVenta("POR_COBRAR");
            venta = ventaRepository.save(venta);
            respuesta.estadoPago("PENDIENTE_COBRO")
                    .estadoVenta("POR_COBRAR");
        }

        return respuesta.build();
    }

    private BigDecimal calcularCostoEnvio(Empresa empresa, BigDecimal subtotalProductos) {
        if (empresa.getEnvioGratisDesde() != null
                && subtotalProductos.compareTo(empresa.getEnvioGratisDesde()) >= 0) {
            return BigDecimal.ZERO;
        }
        return empresa.getCostoEnvio() != null ? empresa.getCostoEnvio() : BigDecimal.ZERO;
    }

    private Cliente resolverCliente(Integer empresaId, TiendaCheckoutRequest request) {
        if (request.getClienteId() != null) {
            return clienteService.buscarPorId(request.getClienteId(), empresaId);
        }
        if (request.getCorreo() != null && !request.getCorreo().isBlank()) {
            return clienteRepository.findByCorreoAndEmpresaId(request.getCorreo(), empresaId)
                    .orElseGet(() -> clienteService.registrarDesdeTienda(
                            empresaId, request.getNombres(), request.getApellidos(),
                            request.getCorreo(), request.getTelefono(), request.getDireccion()));
        }
        throw new RuntimeException("Debe indicar el cliente (id o correo)");
    }
}
