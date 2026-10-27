package com.example.demo.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.model.DetalleVenta;
import com.example.demo.model.Envio;
import com.example.demo.model.Pago;
import com.example.demo.model.Venta;
import com.example.demo.repository.EnvioRepository;
import com.example.demo.repository.PagoRepository;
import com.example.demo.repository.ProductoRepository;
import com.example.demo.repository.VentaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final VentaRepository ventaRepository;
    private final PagoRepository pagoRepository;
    private final EnvioRepository envioRepository;
    private final ProductoRepository productoRepository;
    private final ReciboPdfService reciboPdfService;
    private final CredencialService credencialService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${mercadopago.access-token:}")
    private String fallbackAccessToken;

    @Value("${mercadopago.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final String MP_API = "https://api.mercadopago.com";

    /** Token de Mercado Pago de la empresa (credencial propia), con respaldo global. */
    private String tokenMp(Integer empresaId) {
        String propio = credencialService.obtenerCampo(empresaId, CredencialService.MERCADO_PAGO, "mp_access_token");
        return propio != null && !propio.isBlank() ? propio : fallbackAccessToken;
    }

    public boolean mercadopagoConfigurado(Integer empresaId) {
        return tokenMp(empresaId) != null && !tokenMp(empresaId).isBlank();
    }

    private RestClient mpClient(String token) {
        return RestClient.builder()
                .baseUrl(MP_API)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
    }

    public Pago crearPreferencia(Integer empresaId, Integer ventaId,
                                 String successUrl, String pendingUrl, String failureUrl) {
        Venta venta = ventaRepository.findByIdAndEmpresaId(ventaId, empresaId)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada"));

        Pago existente = pagoRepository.findTopByVentaIdOrderByIdDesc(ventaId).orElse(null);
        if (existente != null && "APROBADO".equals(existente.getEstado())) {
            return existente;
        }

        ObjectNode body = objectMapper.createObjectNode();
        body.put("external_reference", String.valueOf(venta.getId()));
        body.put("notification_url", baseUrl + "/api/pagos/webhook?empresaId=" + empresaId);
        body.put("auto_return", "approved");

        ObjectNode backUrls = body.putObject("back_urls");
        backUrls.put("success", successUrl != null ? successUrl : baseUrl + "/api/pagos/retorno?result=success&id_venta=" + venta.getId());
        backUrls.put("pending", pendingUrl != null ? pendingUrl : baseUrl + "/api/pagos/retorno?result=pending&id_venta=" + venta.getId());
        backUrls.put("failure", failureUrl != null ? failureUrl : baseUrl + "/api/pagos/retorno?result=failure&id_venta=" + venta.getId());

        ArrayNode items = body.putArray("items");
        for (DetalleVenta detalle : venta.getDetalles()) {
            ObjectNode item = items.addObject();
            item.put("id", detalle.getProducto().getId());
            item.put("title", detalle.getProducto().getNombre());
            item.put("description", detalle.getProducto().getDescripcion() != null
                    ? detalle.getProducto().getDescripcion() : detalle.getProducto().getNombre());
            item.put("quantity", detalle.getCantidad());
            item.put("currency_id", "PEN");
            item.put("unit_price", detalle.getPrecioUnitario());
        }

        JsonNode respuesta = mpClient(tokenMp(empresaId)).post()
                .uri("/checkout/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        String preferenceId = respuesta.path("id").asText();
        String initPoint = respuesta.path("init_point").asText();
        String sandboxInitPoint = respuesta.path("sandbox_init_point").asText();

        Pago pago;
        if (existente != null && existente.getEstado().equals("CREADO")) {
            pago = existente;
        } else {
            pago = new Pago();
            pago.setVenta(venta);
            pago.setEmpresa(venta.getEmpresa());
            pago.setProveedor("MERCADO_PAGO");
            pago.setMonto(venta.getTotalVenta());
            pago.setEstado("CREADO");
            pago.setFechaCreacion(LocalDateTime.now());
        }
        pago.setPreferenceId(preferenceId);
        pago.setInitPoint(initPoint != null ? initPoint : sandboxInitPoint);
        return pagoRepository.save(pago);
    }

    @Transactional
    public Map<String, Object> crearPreferenciaVenta(Venta venta) {
        Integer empresaId = venta.getEmpresa().getId();
        if (!mercadopagoConfigurado(empresaId)) {
            throw new RuntimeException("Token de Mercado Pago no configurado");
        }

        ObjectNode body = objectMapper.createObjectNode();
        ObjectNode item = body.putArray("items").addObject();
        item.put("id", "venta-" + venta.getId());
        item.put("title", "Compra #" + venta.getId());
        item.put("quantity", 1);
        item.put("unit_price", venta.getTotalVenta().doubleValue());
        body.put("external_reference", String.valueOf(venta.getId()));

        ObjectNode backUrls = body.putObject("back_urls");
        backUrls.put("success", baseUrl + "/api/pagos/retorno?status=success&id_venta=" + venta.getId());
        backUrls.put("pending", baseUrl + "/api/pagos/retorno?status=pending&id_venta=" + venta.getId());
        backUrls.put("failure", baseUrl + "/api/pagos/retorno?status=failure&id_venta=" + venta.getId());
        body.put("auto_return", "approved");
        body.put("notification_url", baseUrl + "/api/pagos/webhook/mercadopago?empresaId=" + empresaId);

        JsonNode respuesta = mpClient(tokenMp(empresaId)).post()
                .uri("/checkout/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        String paymentUrl = respuesta.path("init_point").asText("");
        String preferenceId = respuesta.path("id").asText("");
        if (paymentUrl.isBlank()) {
            throw new RuntimeException("Respuesta invalida de Mercado Pago");
        }

        Pago pago = new Pago();
        pago.setVenta(venta);
        pago.setEmpresa(venta.getEmpresa());
        pago.setProveedor("MERCADO_PAGO");
        pago.setExternalId(String.valueOf(venta.getId()));
        pago.setPreferenceId(preferenceId);
        pago.setInitPoint(paymentUrl);
        pago.setEstado("CREADO");
        pago.setMonto(venta.getTotalVenta());
        pagoRepository.save(pago);

        return Map.of(
                "idVenta", venta.getId(),
                "paymentUrl", paymentUrl,
                "status", "success",
                "estado", "PENDIENTE_PAGO");
    }

    @Transactional
    public void procesarWebhook(Map<String, Object> payload, Integer empresaId) {
        if (payload == null) {
            return;
        }
        String tipo = payload.get("type") != null ? payload.get("type").toString() : "";
        if (!"payment".equals(tipo)) {
            return;
        }
        Object data = payload.get("data");
        if (!(data instanceof Map<?, ?> dataMap) || dataMap.get("id") == null) {
            return;
        }
        String paymentId = dataMap.get("id").toString();
        if (!"null".equals(paymentId) && !"".equals(paymentId) && !"undefined".equals(paymentId)) {
            verificarPagoPorPaymentId(paymentId, empresaId);
        }
    }

    @Transactional
    public Pago verificarPagoPorPaymentId(String paymentId, Integer empresaId) {
        JsonNode pago = mpClient(tokenMp(empresaId)).get()
                .uri("/v1/payments/{paymentId}", paymentId)
                .retrieve()
                .body(JsonNode.class);

        String externalReference = pago.path("external_reference").asText("");
        Integer ventaId;
        try {
            ventaId = Integer.parseInt(externalReference);
        } catch (NumberFormatException e) {
            throw new NotFoundException("Venta no encontrada para el pago " + paymentId);
        }

        String estadoMp = pago.path("status").asText("pending");
        return aplicarEstadoPago(ventaId, estadoMp, paymentId);
    }

    @Transactional
    public Pago verificarPorVenta(Integer ventaId, Integer empresaId) {
        Venta venta = ventaRepository.findByIdAndEmpresaId(ventaId, empresaId)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada"));

        Pago pago = pagoRepository.findTopByVentaIdOrderByIdDesc(ventaId).orElse(null);
        if (pago == null) {
            throw new NotFoundException("No hay pago para la venta");
        }
        if ("APROBADO".equals(pago.getEstado())) {
            return pago;
        }

        JsonNode respuesta = mpClient(tokenMp(empresaId)).get()
                .uri(uri -> uri.path("/v1/payments/search")
                        .queryParam("external_reference", venta.getId().toString())
                        .queryParam("status", "approved")
                        .build())
                .retrieve()
                .body(JsonNode.class);

        JsonNode resultados = respuesta.path("results");
        if (resultados.isArray() && resultados.size() > 0) {
            JsonNode primero = resultados.get(0);
            String paymentId = primero.path("id").asText();
            String estadoMp = primero.path("status").asText("approved");
            return aplicarEstadoPago(venta.getId(), estadoMp, paymentId);
        }
        return pago;
    }

    @Transactional
    public Pago aplicarEstadoPago(Integer ventaId, String estadoMp, String paymentId) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada"));

        Pago pago = pagoRepository.findTopByVentaIdOrderByIdDesc(ventaId).orElseGet(() -> {
            Pago nuevo = new Pago();
            nuevo.setVenta(venta);
            nuevo.setEmpresa(venta.getEmpresa());
            nuevo.setProveedor("MERCADO_PAGO");
            nuevo.setMonto(venta.getTotalVenta());
            nuevo.setEstado("CREADO");
            nuevo.setFechaCreacion(LocalDateTime.now());
            return nuevo;
        });

        switch (estadoMp == null ? "pending" : estadoMp) {
            case "approved" -> {
                if (!"APROBADO".equals(pago.getEstado())) {
                    pago.setEstado("APROBADO");
                    pago.setPaymentIdMp(paymentId);
                    pago.setFechaConfirmacion(LocalDateTime.now());
                    venta.setEstadoPago("PAGADO");
                    venta.setEstadoVenta("PAGADA");
                    // El stock ya fue reservado al crear la orden (checkout de tienda);
                    // solo se descuenta aquí si la venta se creó sin reserva previa
                    if (!Boolean.TRUE.equals(venta.getStockReservado())) {
                        descontarStock(venta);
                    }
                    reciboPdfService.enviarRecibo(venta);
                }
            }
            case "in_process", "authorized", "pending" -> {
                pago.setEstado("PENDIENTE");
                venta.setEstadoPago("PENDIENTE");
                venta.setEstadoVenta("PENDIENTE_PAGO");
            }
            case "rejected" -> {
                pago.setEstado("RECHAZADO");
                venta.setEstadoPago("RECHAZADO");
                venta.setEstadoVenta("RECHAZADA");
                reponerStockSiReservado(venta);
            }
            default -> {
                pago.setEstado("CANCELADO");
                venta.setEstadoPago("CANCELADO");
                venta.setEstadoVenta("CANCELADA");
                reponerStockSiReservado(venta);
            }
        }

        pagoRepository.save(pago);
        return pago;
    }

    private void reponerStockSiReservado(Venta venta) {
        if (!Boolean.TRUE.equals(venta.getStockReservado())) {
            return;
        }
        for (DetalleVenta detalle : venta.getDetalles()) {
            productoRepository.incrementarStock(
                    detalle.getProducto().getId(), venta.getEmpresa().getId(), detalle.getCantidad());
        }
        venta.setStockReservado(false);
    }

    private void descontarStock(Venta venta) {
        for (DetalleVenta detalle : venta.getDetalles()) {
            int filas = productoRepository.decrementarStock(
                    detalle.getProducto().getId(), venta.getEmpresa().getId(), detalle.getCantidad());
            if (filas == 0) {
                venta.setEstadoVenta("RECHAZADA");
                venta.setEstadoPago("RECHAZADO");
                throw new RuntimeException("Stock insuficiente para " + detalle.getProducto().getNombre());
            }
        }
    }

    public void crearEnvioSiNoExiste(Venta venta, String direccion, String distrito, BigDecimal costoEnvio) {
        if (envioRepository.findByVentaIdAndEmpresaId(venta.getId(), venta.getEmpresa().getId()).isEmpty()) {
            Envio envio = new Envio();
            envio.setVenta(venta);
            envio.setEmpresa(venta.getEmpresa());
            envio.setDireccionEntrega(direccion);
            envio.setDistrito(distrito);
            envio.setCostoEnvio(costoEnvio);
            envio.setEstadoEnvio("PREPARACION");
            envioRepository.save(envio);
        }
    }

    /**
     * Confirma una venta pagada por PayPal (orden ya capturada).
     * Reutiliza la misma lógica de aprobación que Mercado Pago.
     */
    @Transactional
    public Pago aplicarPagoPayPal(Integer ventaId, String paypalOrderId) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada"));

        Pago pago = pagoRepository.findTopByVentaIdOrderByIdDesc(ventaId).orElseGet(() -> {
            Pago nuevo = new Pago();
            nuevo.setVenta(venta);
            nuevo.setEmpresa(venta.getEmpresa());
            nuevo.setProveedor("PAYPAL");
            nuevo.setMonto(venta.getTotalVenta());
            nuevo.setEstado("CREADO");
            nuevo.setFechaCreacion(LocalDateTime.now());
            return nuevo;
        });

        if (!"APROBADO".equals(pago.getEstado())) {
            pago.setEstado("APROBADO");
            pago.setPaymentIdMp(paypalOrderId);
            pago.setFechaConfirmacion(LocalDateTime.now());
            venta.setEstadoPago("PAGADO");
            venta.setEstadoVenta("PAGADA");
            if (!Boolean.TRUE.equals(venta.getStockReservado())) {
                descontarStock(venta);
            }
            pagoRepository.save(pago);
            reciboPdfService.enviarRecibo(venta);
        }
        return pago;
    }
}
