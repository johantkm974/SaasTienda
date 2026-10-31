package com.example.demo.service;

import com.example.demo.model.Venta;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Base64;

/**
 * Envío de correos transaccionales por empresa usando la API de Brevo
 * (https://developers.brevo.com/docs/transactional-email). Sin API key no envía.
 */
@Service
@RequiredArgsConstructor
public class EmailBrevoService {

    private static final String BREVO_API = "https://api.brevo.com/v3";

    private final CredencialService credencialService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String apiKey(Integer empresaId) {
        return credencialService.obtenerCampo(empresaId, CredencialService.EMAIL, "brevo_api_key");
    }

    private String correoFrom(Integer empresaId) {
        return credencialService.obtenerCampo(empresaId, CredencialService.EMAIL, "correo_from");
    }

    private String nombreFrom(Integer empresaId) {
        return credencialService.obtenerCampo(empresaId, CredencialService.EMAIL, "nombre_from");
    }

    public boolean configurado(Integer empresaId) {
        String key = apiKey(empresaId);
        return key != null && !key.isBlank() && correoFrom(empresaId) != null && !correoFrom(empresaId).isBlank();
    }

    /** Envía un correo con adjunto PDF; nunca lanza error (no debe bloquear el pago). */
    public void enviarPdf(Venta venta, String nombreAdjunto, byte[] pdf, String asunto, String html) {
        Integer empresaId = venta.getEmpresa().getId();
        if (!configurado(empresaId)) {
            return;
        }
        enviarInterno(empresaId, venta.getCliente().getCorreo(), venta.getCliente().getNombres(),
                asunto, html, nombreAdjunto, pdf);
    }

    /**
     * Envía un correo simple (sin adjunto). Devuelve true solo si Brevo lo
     * aceptó; false si la empresa no tiene credenciales o si el envío falla.
     * A diferencia de {@link #enviarPdf}, el llamador debe tratar el false como
     * un fallo (p. ej. no emitir un código que nadie podrá recibir).
     */
    public boolean enviar(Integer empresaId, String paraCorreo, String paraNombre,
                          String asunto, String html) {
        if (!configurado(empresaId)) {
            return false;
        }
        return enviarInterno(empresaId, paraCorreo, paraNombre, asunto, html, null, null);
    }

    private boolean enviarInterno(Integer empresaId, String paraCorreo, String paraNombre,
                                  String asunto, String html, String nombreAdjunto, byte[] adjunto) {
        try {
            ObjectNode body = objectMapper.createObjectNode();
            ObjectNode remitente = body.putObject("sender");
            remitente.put("name", nombreFrom(empresaId));
            remitente.put("email", correoFrom(empresaId));
            ArrayNode destinatarios = body.putArray("to");
            ObjectNode destino = destinatarios.addObject();
            destino.put("email", paraCorreo);
            destino.put("name", paraNombre);
            body.put("subject", asunto);
            body.put("htmlContent", html);
            if (adjunto != null) {
                ObjectNode adj = body.putArray("attachment").addObject();
                adj.put("content", Base64.getEncoder().encodeToString(adjunto));
                adj.put("name", nombreAdjunto);
            }

            RestClient.builder()
                    .baseUrl(BREVO_API)
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey(empresaId))
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build()
                    .post()
                    .uri("/smtp/email")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            // Nunca bloquear el flujo de pago por un fallo de correo
            return false;
        }
    }
}
