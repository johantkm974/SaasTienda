package com.example.demo.service;

import com.example.demo.dto.TiendaCheckoutItemRequest;
import com.example.demo.dto.TiendaCheckoutRequest;
import com.example.demo.dto.TiendaCheckoutResponse;
import com.example.demo.model.Cliente;
import com.example.demo.model.ClienteAutenticacion;
import com.example.demo.model.Producto;
import com.example.demo.model.Venta;
import com.example.demo.repository.ClienteAutenticacionRepository;
import com.example.demo.repository.ClienteRepository;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.EnvioRepository;
import com.example.demo.repository.ProductoRepository;
import com.example.demo.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TiendaService {

    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;
    private final ClienteAutenticacionRepository clienteAutenticacionRepository;
    private final EmpresaRepository empresaRepository;
    private final VentaRepository ventaRepository;
    private final EnvioRepository envioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TiendaContext tiendaContext;
    private final TiendaPublicaService tiendaPublicaService;

    public Integer empresaIdActual() {
        return tiendaContext.empresaIdActual();
    }

    public List<ProductoTiendaResponse> listarProductos() {
        Integer empresaId = tiendaContext.empresaIdActual();
        return productoRepository.findByEmpresaId(empresaId).stream()
                .filter(producto -> producto.getStockActual() != null && producto.getStockActual() > 0)
                .map(ProductoTiendaResponse::from)
                .toList();
    }

    public ProductoTiendaResponse obtenerProducto(Integer idProducto) {
        Integer empresaId = tiendaContext.empresaIdActual();
        Producto producto = productoRepository.findByIdAndEmpresaId(idProducto, empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no disponible"));
        return ProductoTiendaResponse.from(producto);
    }

    @Transactional
    public Map<String, Object> registrarCliente(RegistroClienteRequest request) {
        Integer empresaId = tiendaContext.empresaIdActual();

        clienteRepository.findByCorreoAndEmpresaId(request.correo(), empresaId)
                .ifPresent(cliente -> {
                    throw new IllegalArgumentException("El correo ya esta registrado");
                });

        Cliente cliente = new Cliente();
        cliente.setNombres(request.nombres());
        cliente.setApellidos(request.apellidos());
        cliente.setCorreo(request.correo());
        cliente.setTelefono(request.telefono());
        cliente.setDireccion(request.direccion());
        cliente.setEstado("ACTIVO");
        cliente.setEmpresa(empresaRepository.findById(empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Tienda no encontrada")));
        Cliente clienteGuardado = clienteRepository.save(cliente);

        ClienteAutenticacion autenticacion = new ClienteAutenticacion();
        autenticacion.setCliente(clienteGuardado);
        autenticacion.setCorreo(request.correo());
        autenticacion.setPasswordHash(passwordEncoder.encode(request.contrasena()));
        autenticacion.setUltimoAcceso(LocalDateTime.now());
        clienteAutenticacionRepository.save(autenticacion);

        return sesionCliente(clienteGuardado, request.correo());
    }

    @Transactional
    public Map<String, Object> loginCliente(LoginClienteRequest request) {
        ClienteAutenticacion autenticacion = clienteAutenticacionRepository.findByCorreo(request.correo())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales invalidas"));

        if (!passwordEncoder.matches(request.contrasena(), autenticacion.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciales invalidas");
        }

        autenticacion.setUltimoAcceso(LocalDateTime.now());
        clienteAutenticacionRepository.save(autenticacion);

        return sesionCliente(autenticacion.getCliente(), autenticacion.getCorreo());
    }

    /**
     * Checkout unificado: toda la lógica de venta vive en TiendaPublicaService.
     * El cliente logueado se resuelve por correo; la compra queda contra entrega.
     */
    @Transactional
    public VentaClienteResponse checkout(String correoCliente, CheckoutRequest request) {
        return ejecutarCheckout(correoCliente, request, false);
    }

    @Transactional
    public VentaClienteResponse checkoutConPago(String correoCliente, CheckoutRequest request) {
        return ejecutarCheckout(correoCliente, request, true);
    }

    /** Checkout sin login (guest): el cliente se crea/recupera automáticamente. */
    @Transactional
    public VentaClienteResponse checkoutPublico(CheckoutPublicoRequest request) {
        TiendaCheckoutRequest dto = toCheckoutDto(
                request.nombres(), request.apellidos(), request.correo(),
                request.telefono(), request.direccionEntrega(), request.distrito(),
                request.conPago(), request.items());
        TiendaCheckoutResponse respuesta = tiendaPublicaService.checkout(tiendaContext.empresaIdActual(), dto);
        return ventaDe(respuesta.getVentaId());
    }

    private VentaClienteResponse ejecutarCheckout(String correoCliente, CheckoutRequest request, boolean conPago) {
        Integer empresaId = tiendaContext.empresaIdActual();
        Cliente cliente = clienteRepository.findByCorreoAndEmpresaId(correoCliente, empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));

        TiendaCheckoutRequest dto = toCheckoutDto(
                cliente.getNombres(), cliente.getApellidos(), cliente.getCorreo(),
                cliente.getTelefono(), request.direccionEntrega(), request.distrito(),
                conPago, request.items());
        TiendaCheckoutResponse respuesta = tiendaPublicaService.checkout(empresaId, dto);
        return ventaDe(respuesta.getVentaId());
    }

    private TiendaCheckoutRequest toCheckoutDto(String nombres, String apellidos, String correo,
                                                String telefono, String direccion, String distrito,
                                                boolean conPago, List<ItemCheckoutRequest> items) {
        TiendaCheckoutRequest dto = new TiendaCheckoutRequest();
        dto.setNombres(nombres);
        dto.setApellidos(apellidos);
        dto.setCorreo(correo);
        dto.setTelefono(telefono);
        dto.setDireccion(direccion);
        dto.setDistrito(distrito);
        dto.setConPago(conPago);
        dto.setItems(items == null ? List.of() : items.stream()
                .map(i -> {
                    TiendaCheckoutItemRequest item = new TiendaCheckoutItemRequest();
                    item.setProductoId(i.idProducto());
                    item.setCantidad(i.cantidad());
                    return item;
                })
                .toList());
        return dto;
    }

    private VentaClienteResponse ventaDe(Integer ventaId) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new IllegalArgumentException("Venta no encontrada"));
        return ventaResponse(venta);
    }

    public List<VentaClienteResponse> misCompras(String correoCliente) {
        Integer empresaId = tiendaContext.empresaIdActual();
        Cliente cliente = clienteRepository.findByCorreoAndEmpresaId(correoCliente, empresaId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente no encontrado"));
        return ventaRepository.findByClienteIdAndEmpresaId(cliente.getId(), empresaId).stream()
                .map(this::ventaResponse)
                .toList();
    }

    private Map<String, Object> sesionCliente(Cliente cliente, String correo) {
        String token = jwtService.generateToken(correo, "CLIENTE");
        String refreshToken = jwtService.generateRefreshToken(correo, "CLIENTE");
        return Map.of(
                "token", token,
                "refreshToken", refreshToken,
                "tipo", "Bearer",
                "cliente", cliente
        );
    }

    private VentaClienteResponse ventaResponse(Venta venta) {
        List<DetalleClienteResponse> detalles = venta.getDetalles() == null ? List.of()
                : venta.getDetalles().stream()
                        .map(detalle -> new DetalleClienteResponse(
                                detalle.getProducto().getId(),
                                detalle.getProducto().getNombre(),
                                detalle.getCantidad(),
                                detalle.getPrecioUnitario(),
                                detalle.getSubtotal()))
                        .toList();

        EnvioClienteResponse envio = envioRepository.findByVentaIdAndEmpresaId(
                        venta.getId(), venta.getEmpresa().getId())
                .map(item -> new EnvioClienteResponse(
                        item.getDireccionEntrega(),
                        item.getDistrito(),
                        item.getCostoEnvio(),
                        item.getEstadoEnvio()))
                .orElse(null);

        return new VentaClienteResponse(
                venta.getId(),
                venta.getFecha(),
                venta.getEstadoVenta(),
                venta.getTotalVenta(),
                detalles,
                envio);
    }

    public record RegistroClienteRequest(
            String nombres,
            String apellidos,
            String correo,
            String telefono,
            String direccion,
            String contrasena) {
    }

    public record LoginClienteRequest(String correo, String contrasena) {
    }

    public record CheckoutRequest(
            List<ItemCheckoutRequest> items,
            String direccionEntrega,
            String distrito,
            BigDecimal costoEnvio) {
    }

    public record CheckoutPublicoRequest(
            List<ItemCheckoutRequest> items,
            String nombres,
            String apellidos,
            String correo,
            String telefono,
            String direccionEntrega,
            String distrito,
            boolean conPago) {
    }

    public record ItemCheckoutRequest(Integer idProducto, Integer cantidad) {
    }

    public record ProductoTiendaResponse(
            Integer idProducto,
            String codigoSku,
            String nombre,
            String descripcion,
            BigDecimal precio,
            Integer stock,
            String marca,
            String imagen,
            String categoria) {
        public static ProductoTiendaResponse from(Producto producto) {
            return new ProductoTiendaResponse(
                    producto.getId(),
                    producto.getCodigoSku(),
                    producto.getNombre(),
                    producto.getDescripcion(),
                    producto.getPrecioVenta(),
                    producto.getStockActual(),
                    producto.getMarca(),
                    producto.getImagenUrl(),
                    producto.getCategoria() == null ? null : producto.getCategoria().getNombre());
        }
    }

    public record VentaClienteResponse(
            Integer idVenta,
            LocalDateTime fechaVenta,
            String estado,
            BigDecimal total,
            List<DetalleClienteResponse> detalles,
            EnvioClienteResponse envio) {
    }

    public record DetalleClienteResponse(
            Integer idProducto,
            String producto,
            Integer cantidad,
            BigDecimal precioUnitario,
            BigDecimal subtotal) {
    }

    public record EnvioClienteResponse(
            String direccionEntrega,
            String distrito,
            BigDecimal costoEnvio,
            String estadoEnvio) {
    }
}
