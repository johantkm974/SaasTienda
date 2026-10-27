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
        if (!configurado(venta.getEmpresa().getId())) {
            return;
        }
        try {
            ObjectNode body = objectMapper.createObjectNode();
            ObjectNode remitente = body.putObject("sender");
            remitente.put("name", nombreFrom(venta.getEmpresa().getId()));
            remitente.put("email", correoFrom(venta.getEmpresa().getId()));
            ArrayNode destinatarios = body.putArray("to");
            ObjectNode destino = destinatarios.addObject();
            destino.put("email", venta.getCliente().getCorreo());
            destino.put("name", venta.getCliente().getNombres());
            body.put("subject", asunto);
            body.put("htmlContent", html);
            ObjectNode adjunto = body.putArray("attachment").addObject();
            adjunto.put("content", Base64.getEncoder().encodeToString(pdf));
            adjunto.put("name", nombreAdjunto);

            RestClient.builder()
                    .baseUrl(BREVO_API)
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey(venta.getEmpresa().getId()))
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build()
                    .post()
                    .uri("/smtp/email")
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            // Nunca bloquear el flujo de pago por un fallo de correo
        }
    }
}
