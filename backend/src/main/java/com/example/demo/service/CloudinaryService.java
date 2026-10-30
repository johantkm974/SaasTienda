package com.example.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final CredencialService credencialService;

    @Value("${cloudinary.cloud-name:}")
    private String fallbackCloudName;

    @Value("${cloudinary.api-key:}")
    private String fallbackApiKey;

    @Value("${cloudinary.api-secret:}")
    private String fallbackApiSecret;

    @Value("${cloudinary.upload-preset:}")
    private String fallbackUploadPreset;

    private String cloudName(Integer empresaId) {
        return campo(empresaId, "cloud_name", fallbackCloudName);
    }

    private String apiKey(Integer empresaId) {
        return campo(empresaId, "api_key", fallbackApiKey);
    }

    private String apiSecret(Integer empresaId) {
        return campo(empresaId, "api_secret", fallbackApiSecret);
    }

    private String uploadPreset(Integer empresaId) {
        return campo(empresaId, "upload_preset", fallbackUploadPreset);
    }

    private String campo(Integer empresaId, String clave, String global) {
        String propio = credencialService.obtenerCampo(empresaId, CredencialService.CLOUDINARY, clave);
        return propio != null && !propio.isBlank() ? propio : global;
    }

    public boolean configurado(Integer empresaId) {
        return cloudName(empresaId) != null && !cloudName(empresaId).isBlank();
    }

    private RestClient cliente(Integer empresaId) {
        return RestClient.builder()
                .baseUrl("https://api.cloudinary.com/v1_1/" + cloudName(empresaId))
                .build();
    }

    public String subirBase64(Integer empresaId, String dataBase64) {
        if (!configurado(empresaId)) {
            throw new RuntimeException("Cloudinary no configurado en la tienda");
        }
        if (dataBase64 == null || dataBase64.isBlank()) {
            throw new RuntimeException("Imagen vacía");
        }

        String base64 = dataBase64.contains(",")
                ? dataBase64.substring(dataBase64.indexOf(",") + 1)
                : dataBase64;

        try {
            Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Imagen base64 inválida");
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        String timestamp = String.valueOf(System.currentTimeMillis() / 1000L);
        form.add("timestamp", timestamp);
        form.add("file", "data:image/png;base64," + base64);
        form.add("folder", "saas");

        String preset = uploadPreset(empresaId);
        String secreto = apiSecret(empresaId);
        if (preset != null && !preset.isBlank()) {
            form.add("upload_preset", preset);
        } else if (secreto != null && !secreto.isBlank()) {
            Map<String, String> params = new LinkedHashMap<>();
            params.put("timestamp", timestamp);
            params.put("folder", "saas");
            form.add("api_key", apiKey(empresaId));
            form.add("signature", firmar(params, secreto));
        }

        JsonNode respuesta = cliente(empresaId).post()
                .uri("/image/upload")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(JsonNode.class);

        String secureUrl = respuesta.path("secure_url").asText("");
        if (secureUrl.isBlank()) {
            throw new RuntimeException("Error al subir la imagen a Cloudinary");
        }
        return secureUrl;
    }

    private String firmar(Map<String, String> params, String secreto) {
        String cadena = params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + e.getValue())
                .reduce((a, b) -> a + "&" + b)
                .orElse("") + secreto;
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(secreto.getBytes(StandardCharsets.UTF_8), "HmacSHA1"));
            byte[] hash = mac.doFinal(cadena.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error al firmar la petición a Cloudinary", e);
        }
    }
}
