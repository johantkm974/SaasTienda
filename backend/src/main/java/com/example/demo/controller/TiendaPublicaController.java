package com.example.demo.controller;

import com.example.demo.dto.TiendaCheckoutRequest;
import com.example.demo.dto.TiendaCheckoutResponse;
import com.example.demo.dto.TiendaInfoResponse;
import com.example.demo.dto.TiendaProductoResponse;
import com.example.demo.exception.NotFoundException;
import com.example.demo.model.Banner;
import com.example.demo.model.Categoria;
import com.example.demo.model.Cliente;
import com.example.demo.model.Empresa;
import com.example.demo.model.Producto;
import com.example.demo.model.Venta;
import com.example.demo.repository.EnvioRepository;
import com.example.demo.repository.VentaRepository;
import com.example.demo.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tienda/{empresaId}")
@RequiredArgsConstructor
public class TiendaPublicaController {

    private final TiendaPublicaService tiendaPublicaService;
    private final CategoriaService categoriaService;
    private final ProductoService productoService;
    private final ClienteService clienteService;
    private final BannerService bannerService;
    private final ContenidoService contenidoService;
    private final VentaRepository ventaRepository;
    private final EnvioRepository envioRepository;
    private final JwtService jwtService;
    private final ReciboPdfService reciboPdfService;

    @GetMapping
    public TiendaInfoResponse infoTienda(@PathVariable Integer empresaId) {

        Empresa empresa = tiendaPublicaService.obtenerTienda(empresaId);

        List<Categoria> categorias = categoriaService.listarPorEmpresa(empresaId);
        List<Producto> productos = productoService.listarPorEmpresa(empresaId);

        return TiendaInfoResponse.builder()
                .id(empresa.getId())
                .nombreComercial(empresa.getNombreComercial())
                .logoUrl(empresa.getLogoUrl())
                .slogan(empresa.getSlogan())
                .colorPrimario(empresa.getColorPrimario())
                .bannerUrl(empresa.getBannerUrl())
                .mostrarStock(empresa.getMostrarStock())
                .contraEntrega(Boolean.TRUE.equals(empresa.getContraEntrega()))
                .contraEntregaMaximo(empresa.getContraEntregaMaximo())
                .costoEnvio(empresa.getCostoEnvio())
                .envioGratisDesde(empresa.getEnvioGratisDesde())
                .activa(empresa.getEstado() != null
                        && "ACTIVO".equals(empresa.getEstado().name()))
                .categorias(categorias.stream()
                        .filter(c -> Boolean.TRUE.equals(c.getVisibleTienda()))
                        .map(c -> TiendaInfoResponse.CategoriaTiendaResponse.builder()
                                .id(c.getId())
                                .nombre(c.getNombre())
                                .descripcion(c.getDescripcion())
                                .build())
                        .toList())
                .productos(productos.stream()
                        .filter(p -> p.getCategoria() == null
                                || Boolean.TRUE.equals(p.getCategoria().getVisibleTienda()))
                        .map(TiendaPublicaController::aProductoResponse)
                        .toList())
                .banners(bannerService.listarPublicos(empresaId, "tienda").stream()
                        .map(TiendaPublicaController::aBannerResponse)
                        .toList())
                .build();
    }

    @GetMapping("/contenido/{vista}")
    public Map<String, Object> contenidoVista(@PathVariable Integer empresaId,
                                              @PathVariable String vista) {

        tiendaPublicaService.obtenerTienda(empresaId);

        return Map.of(
                "contenido", contenidoService.obtenerVista(empresaId, vista),
                "banners", bannerService.listarPublicos(empresaId, vista).stream()
                        .map(TiendaPublicaController::aBannerResponse)
                        .toList());
    }

    @PostMapping("/registro")
    public Object registrarCliente(@PathVariable Integer empresaId,
                                   @RequestBody RegistroClienteTiendaRequest request) {
        if (request.contrasena() != null && !request.contrasena().isBlank()) {
            // Híbrido: registro con contraseña -> devuelve sesión (token de cliente)
            return clienteService.registrarConCuenta(
                    empresaId, request.nombres(), request.apellidos(), request.correo(),
                    request.telefono(), request.direccion(), request.contrasena());
        }
        Cliente cliente = new Cliente();
        cliente.setNombres(request.nombres());
        cliente.setApellidos(request.apellidos());
        cliente.setCorreo(request.correo());
        cliente.setTelefono(request.telefono());
        cliente.setDireccion(request.direccion());
        return clienteService.registrar(empresaId, cliente);
    }

    @PostMapping("/login")
    public Map<String, Object> loginCliente(@PathVariable Integer empresaId,
                                            @RequestBody LoginClienteTiendaRequest request) {
        return clienteService.login(empresaId, request.correo(), request.contrasena());
    }

    @PostMapping("/checkout")
    public TiendaCheckoutResponse checkout(@PathVariable Integer empresaId,
                                           @RequestBody TiendaCheckoutRequest request) {
        return tiendaPublicaService.checkout(empresaId, request);
    }

    @GetMapping("/mis-compras")
    public List<Map<String, Object>> misCompras(@PathVariable Integer empresaId,
                                                @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !"CLIENTE".equals(jwtService.obtenerRolDeToken(authorization))) {
            throw new NotFoundException("Sesion de cliente invalida");
        }
        String correo = jwtService.extractSubject(authorization);
        Cliente cliente = clienteService.buscarPorCorreo(correo, empresaId);
        List<Venta> ventas = ventaRepository.findByClienteIdAndEmpresaId(cliente.getId(), empresaId);
        return ventas.stream()
                .map(v -> {
                    Map<String, Object> venta = new HashMap<>();
                    venta.put("id", v.getId());
                    venta.put("fecha", v.getFecha());
                    venta.put("totalVenta", v.getTotalVenta());
                    venta.put("estadoPago", v.getEstadoPago());
                    venta.put("estadoVenta", v.getEstadoVenta());
                    venta.put("metodoPago", v.getMetodoPago());
                    venta.put("detalles", v.getDetalles() == null ? List.of()
                            : v.getDetalles().stream().map(d -> {
                                Map<String, Object> detalle = new HashMap<>();
                                detalle.put("producto", d.getProducto().getNombre());
                                detalle.put("cantidad", d.getCantidad());
                                detalle.put("precioUnitario", d.getPrecioUnitario());
                                detalle.put("subtotal", d.getSubtotal());
                                return detalle;
                            }).toList());
                    envioRepository.findByVentaIdAndEmpresaId(v.getId(), empresaId)
                            .ifPresent(e -> {
                                Map<String, Object> envio = new HashMap<>();
                                envio.put("estadoEnvio", e.getEstadoEnvio());
                                envio.put("direccionEntrega", e.getDireccionEntrega());
                                envio.put("distrito", e.getDistrito());
                                envio.put("costoEnvio", e.getCostoEnvio());
                                envio.put("transportista", e.getTransportista());
                                envio.put("guiaTracking", e.getGuiaTracking());
                                venta.put("envio", envio);
                            });
                    return venta;
                })
                .toList();
    }

    @GetMapping("/compras/{correo}")
    public List<Venta> comprasPorCorreo(@PathVariable Integer empresaId,
                                        @PathVariable String correo) {
        tiendaPublicaService.obtenerTienda(empresaId);
        Cliente cliente = clienteService.buscarPorCorreo(correo, empresaId);
        return ventaRepository.findByClienteIdAndEmpresaId(cliente.getId(), empresaId);
    }

    @GetMapping("/compras/{ventaId}/recibo")
    public ResponseEntity<byte[]> reciboVenta(@PathVariable Integer empresaId,
                                              @PathVariable Integer ventaId,
                                              @RequestParam(required = false) String correo,
                                              @RequestHeader(value = "Authorization", required = false) String authorization) {
        Venta venta = ventaRepository.findByIdAndEmpresaId(ventaId, empresaId)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada"));

        String correoValido = correo;
        if (correoValido == null && authorization != null) {
            correoValido = jwtService.extractSubject(authorization);
        }
        if (correoValido == null || venta.getCliente() == null
                || !correoValido.equalsIgnoreCase(venta.getCliente().getCorreo())) {
            throw new NotFoundException("Recibo no disponible para ese correo");
        }

        byte[] pdf = reciboPdfService.generarRecibo(venta);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("recibo_venta_" + venta.getId() + ".pdf").build());
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    public record RegistroClienteTiendaRequest(
            String nombres,
            String apellidos,
            String correo,
            String telefono,
            String direccion,
            String contrasena) {
    }

    public record LoginClienteTiendaRequest(String correo, String contrasena) {
    }

    private static TiendaProductoResponse aProductoResponse(Producto p) {
        return TiendaProductoResponse.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .marca(p.getMarca())
                .precioVenta(p.getPrecioVenta())
                .stockActual(p.getStockActual())
                .imagenUrl(p.getImagenUrl())
                .destacado(Boolean.TRUE.equals(p.getDestacado()))
                .categoria(p.getCategoria() == null ? null
                        : TiendaProductoResponse.CategoriaLigera.builder()
                                .id(p.getCategoria().getId())
                                .nombre(p.getCategoria().getNombre())
                                .build())
                .build();
    }

    private static TiendaInfoResponse.BannerTiendaResponse aBannerResponse(Banner b) {
        return TiendaInfoResponse.BannerTiendaResponse.builder()
                .id(b.getId())
                .titulo(b.getTitulo())
                .subtitulo(b.getSubtitulo())
                .descripcion(b.getDescripcion())
                .imagenUrl(b.getImagenUrl())
                .enlace(b.getEnlace())
                .build();
    }
}
