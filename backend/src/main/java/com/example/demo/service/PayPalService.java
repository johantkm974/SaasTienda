package com.example.demo.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.model.Pago;
import com.example.demo.model.Venta;
import com.example.demo.repository.PagoRepository;
import com.example.demo.repository.VentaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PayPalService {

    private final VentaRepository ventaRepository;
    private final PagoRepository pagoRepository;
    private final PagoService pagoService;
    private final CredencialService credencialService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${paypal.client-id:}")
    private String fallbackClientId;

    @Value("${paypal.client-secret:}")
    private String fallbackClientSecret;

    @Value("${paypal.mode:sandbox}")
    private String fallbackMode;

    @Value("${paypal.return-url:}")
    private String returnUrl;

    @Value("${paypal.cancel-url:}")
    private String cancelUrl;

    private String clientId(Integer empresaId) {
        String propio = credencialService.obtenerCampo(empresaId, CredencialService.PAYPAL, "paypal_client_id");
        return propio != null && !propio.isBlank() ? propio : fallbackClientId;
    }

    private String clientSecret(Integer empresaId) {
        String propio = credencialService.obtenerCampo(empresaId, CredencialService.PAYPAL, "paypal_client_secret");
        return propio != null && !propio.isBlank() ? propio : fallbackClientSecret;
    }

    private String modo(Integer empresaId) {
        String propio = credencialService.obtenerCampo(empresaId, CredencialService.PAYPAL, "paypal_mode");
        return propio != null && !propio.isBlank() ? propio : fallbackMode;
    }

    private String apiUrl(Integer empresaId) {
        return "sandbox".equalsIgnoreCase(modo(empresaId))
                ? "https://api-m.sandbox.paypal.com"
                : "https://api-m.paypal.com";
    }

    public boolean paypalConfigurado(Integer empresaId) {
        return clientId(empresaId) != null && !clientId(empresaId).isBlank()
                && clientSecret(empresaId) != null && !clientSecret(empresaId).isBlank();
    }

    private String obtenerAccessToken(Integer empresaId) {
        String credenciales = Base64.getEncoder()
                .encodeToString((clientId(empresaId) + ":" + clientSecret(empresaId))
                        .getBytes(StandardCharsets.UTF_8));
        JsonNode respuesta = RestClient.builder()
                .baseUrl(apiUrl(empresaId))
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Basic " + credenciales)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                .build()
                .post()
                .uri("/v1/oauth2/token")
                .body("grant_type=client_credentials")
                .retrieve()
                .body(JsonNode.class);
        return respuesta.path("access_token").asText();
    }

    private RestClient paypalClient(Integer empresaId, String accessToken) {
        return RestClient.builder()
                .baseUrl(apiUrl(empresaId))
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Transactional
    public String crearOrden(Integer empresaId, Integer ventaId) {
        Venta venta = ventaRepository.findByIdAndEmpresaId(ventaId, empresaId)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada"));

        Pago existente = pagoRepository.findTopByVentaIdOrderByIdDesc(ventaId).orElse(null);
        if (existente != null && "APROBADO".equals(existente.getEstado())) {
            return existente.getInitPoint();
        }

        ObjectNode body = objectMapper.createObjectNode();
        body.put("intent", "CAPTURE");
        ObjectNode purchaseUnit = body.putArray("purchase_units").addObject();
        purchaseUnit.put("reference_id", "venta-" + venta.getId());
        purchaseUnit.put("custom_id", String.valueOf(venta.getId()));
        ObjectNode monto = purchaseUnit.putObject("amount");
        monto.put("currency_code", "PEN");
        monto.put("value", venta.getTotalVenta().toPlainString());
        ObjectNode contexto = body.putObject("application_context");
        contexto.put("brand_name", venta.getEmpresa().getNombreComercial());
        contexto.put("return_url", returnUrl + "?ventaId=" + venta.getId());
        contexto.put("cancel_url", cancelUrl + "?ventaId=" + venta.getId());
        contexto.put("user_action", "PAY_NOW");

        JsonNode respuesta = paypalClient(empresaId, obtenerAccessToken(empresaId)).post()
                .uri("/v2/checkout/orders")
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        String orderId = respuesta.path("id").asText();
        String approveUrl = "";
        for (JsonNode link : respuesta.path("links")) {
            if ("approve".equals(link.path("rel").asText())) {
                approveUrl = link.path("href").asText();
                break;
            }
        }
        if (approveUrl.isBlank()) {
            throw new RuntimeException("No se pudo crear el pago con PayPal");
        }

        Pago pago;
        if (existente != null && "CREADO".equals(existente.getEstado())) {
            pago = existente;
        } else {
            pago = new Pago();
            pago.setVenta(venta);
            pago.setEmpresa(venta.getEmpresa());
            pago.setProveedor("PAYPAL");
            pago.setMonto(venta.getTotalVenta());
            pago.setEstado("CREADO");
            pago.setFechaCreacion(LocalDateTime.now());
        }
        pago.setExternalId(orderId);
        pago.setInitPoint(approveUrl);
        pagoRepository.save(pago);

        return approveUrl;
    }

    public Integer obtenerVentaIdPorOrden(String paypalOrderId) {
        if (paypalOrderId == null || paypalOrderId.isBlank()) {
            throw new IllegalArgumentException("Orden de PayPal no valida");
        }
        Pago pago = pagoRepository.findByExternalId(paypalOrderId).orElse(null);
        if (pago == null) {
            throw new IllegalArgumentException("Orden de PayPal no encontrada");
        }
        return pago.getVenta().getId();
    }

    @Transactional
    public Pago capturarOrden(Integer ventaId, String paypalOrderId) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new NotFoundException("Venta no encontrada"));

        // La orden debe estar registrada a ESTA venta: sin esta comprobación,
        // una orden propia podría acreditar el pago de otra venta más cara.
        Pago orden = pagoRepository.findByExternalId(paypalOrderId)
                .orElseThrow(() -> new NotFoundException("Orden de PayPal no encontrada"));
        if (orden.getVenta() == null || !ventaId.equals(orden.getVenta().getId())
                || orden.getEmpresa() == null
                || !venta.getEmpresa().getId().equals(orden.getEmpresa().getId())) {
            throw new RuntimeException("La orden de PayPal no corresponde a esta venta");
        }

        JsonNode respuesta = paypalClient(venta.getEmpresa().getId(), obtenerAccessToken(venta.getEmpresa().getId())).post()
                .uri("/v2/checkout/orders/{id}/capture", paypalOrderId)
                .header("PayPal-Request-Id", "captura-" + ventaId + "-" + System.currentTimeMillis())
                .retrieve()
                .body(JsonNode.class);

        String estado = respuesta.path("status").asText();
        if (!"COMPLETED".equals(estado)) {
            throw new RuntimeException("El pago no fue completado por PayPal (estado: " + estado + ")");
        }
        validarMontoCapturado(respuesta, venta);
        return pagoService.aplicarPagoPayPal(venta.getId(), paypalOrderId);
    }

    /**
     * Compara importe y moneda capturados con los de la venta antes de acreditar.
     * Si no coinciden, no se marca la venta como pagada (fallo cerrado).
     */
    private void validarMontoCapturado(JsonNode respuesta, Venta venta) {
        JsonNode unidades = respuesta.path("purchase_units");
        if (!unidades.isArray() || unidades.isEmpty()) {
            throw new RuntimeException("PayPal no devolvió el detalle de la compra capturada");
        }
        JsonNode monto = unidades.get(0).path("amount");
        String moneda = monto.path("currency_code").asText("");
        if (!"PEN".equalsIgnoreCase(moneda)) {
            throw new RuntimeException("Moneda capturada no válida: " + moneda);
        }
        BigDecimal valor;
        try {
            valor = new BigDecimal(monto.path("value").asText(""));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Importe capturado no válido");
        }
        if (venta.getTotalVenta() == null || valor.compareTo(venta.getTotalVenta()) != 0) {
            throw new RuntimeException("El importe capturado (" + valor
                    + ") no coincide con la venta (" + venta.getTotalVenta() + ")");
        }
    }
}
