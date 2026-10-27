package com.example.demo.service;

import com.example.demo.exception.NotFoundException;
import com.example.demo.model.CredencialEmpresa;
import com.example.demo.model.Empresa;
import com.example.demo.repository.CredencialEmpresaRepository;
import com.example.demo.repository.EmpresaRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Guarda y lee las credenciales de integración (Mercado Pago, PayPal, Cloudinary, email)
 * de cada empresa, cifradas en base de datos con AES-GCM.
 */
@Service
@RequiredArgsConstructor
public class CredencialService {

    public static final String MERCADO_PAGO = "MERCADO_PAGO";
    public static final String PAYPAL = "PAYPAL";
    public static final String CLOUDINARY = "CLOUDINARY";
    public static final String EMAIL = "EMAIL";

    private final CredencialEmpresaRepository credencialRepository;
    private final EmpresaRepository empresaRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.credenciales-key:clave_maestra_desarrollo_saas_2026}")
    private String claveMaestra;

    /** Cifra y guarda el mapa de credenciales; los valores vacíos conservan el valor anterior. */
    @Transactional
    public Map<String, Object> guardar(Integer empresaId, String proveedor, Map<String, String> datos) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new NotFoundException("Empresa no encontrada"));

        Map<String, String> combinado = leer(empresaId, proveedor);
        if (datos != null) {
            for (Map.Entry<String, String> entrada : datos.entrySet()) {
                if (entrada.getValue() != null && !entrada.getValue().isBlank()) {
                    combinado.put(entrada.getKey(), entrada.getValue().trim());
                }
            }
        }

        CredencialEmpresa credencial = credencialRepository
                .findByEmpresaIdAndProveedor(empresaId, proveedor)
                .orElseGet(() -> {
                    CredencialEmpresa nueva = new CredencialEmpresa();
                    nueva.setEmpresa(empresa);
                    nueva.setProveedor(proveedor);
                    return nueva;
                });
        credencial.setDatoCifrado(cifrar(escribirJson(combinado)));
        credencialRepository.save(credencial);

        return resumen(empresaId, proveedor);
    }

    /** Lee las credenciales descifradas de un proveedor (mapa vacío si no hay). */
    public Map<String, String> leer(Integer empresaId, String proveedor) {
        return credencialRepository.findByEmpresaIdAndProveedor(empresaId, proveedor)
                .map(credencial -> leerJson(descifrar(credencial.getDatoCifrado())))
                .orElseGet(HashMap::new);
    }

    public String obtenerCampo(Integer empresaId, String proveedor, String campo) {
        return leer(empresaId, proveedor).getOrDefault(campo, "");
    }

    /** Resumen enmascarado (nunca expone el secreto completo) para mostrar en el panel. */
    public Map<String, Object> resumen(Integer empresaId) {
        Map<String, Object> resultado = new LinkedHashMap<>();
        for (String proveedor : new String[]{MERCADO_PAGO, PAYPAL, CLOUDINARY, EMAIL}) {
            resultado.put(proveedor, resumen(empresaId, proveedor));
        }
        return resultado;
    }

    private Map<String, Object> resumen(Integer empresaId, String proveedor) {
        Map<String, Object> campos = new LinkedHashMap<>();
        Map<String, String> datos = leer(empresaId, proveedor);
        if (datos.isEmpty()) {
            return campos;
        }
        for (Map.Entry<String, String> entrada : datos.entrySet()) {
            campos.put(entrada.getKey(), Map.of(
                    "presente", true,
                    "valor", enmascarar(entrada.getValue())));
        }
        return campos;
    }

    private String enmascarar(String valor) {
        if (valor == null || valor.isBlank()) {
            return "";
        }
        if (valor.length() <= 8) {
            return "****";
        }
        return valor.substring(0, 4) + "****" + valor.substring(valor.length() - 4);
    }

    private String escribirJson(Map<String, String> datos) {
        try {
            return objectMapper.writeValueAsString(datos);
        } catch (Exception e) {
            throw new RuntimeException("Error al serializar credenciales", e);
        }
    }

    private Map<String, String> leerJson(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    private SecretKeySpec clave() {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(claveMaestra.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(digest, "AES");
        } catch (Exception e) {
            throw new RuntimeException("Error al derivar clave de cifrado", e);
        }
    }

    private String cifrar(String texto) {
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            byte[] iv = new byte[12];
            SecureRandom.getInstanceStrong().nextBytes(iv);
            cipher.init(Cipher.ENCRYPT_MODE, clave(), new GCMParameterSpec(128, iv));
            byte[] cifrado = cipher.doFinal(texto.getBytes(StandardCharsets.UTF_8));
            byte[] salida = new byte[iv.length + cifrado.length];
            System.arraycopy(iv, 0, salida, 0, iv.length);
            System.arraycopy(cifrado, 0, salida, iv.length, cifrado.length);
            return Base64.getEncoder().encodeToString(salida);
        } catch (Exception e) {
            throw new RuntimeException("Error al cifrar credenciales", e);
        }
    }

    private String descifrar(String base64) {
        try {
            byte[] entrada = Base64.getDecoder().decode(base64);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, clave(), new GCMParameterSpec(128, entrada, 0, 12));
            return new String(cipher.doFinal(entrada, 12, entrada.length - 12), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Error al descifrar credenciales", e);
        }
    }
}
