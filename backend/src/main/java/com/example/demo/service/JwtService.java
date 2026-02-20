package com.example.demo.service;

import com.example.demo.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    // Asegúrate de que esta clave sea larga (mínimo 32 caracteres)
    private final String SECRET_KEY = "mi_clave_super_secreta_2026_muy_larga_para_evitar_errores";

    // ✅ ESTE ES EL MÉTODO QUE TE FALTA
    public String generateToken(Usuario usuario) {
        Map<String, Object> extraClaims = new HashMap<>();
        
        // Aquí guardamos la "llave" de la y 
        extraClaims.put("userId", usuario.getId());
        extraClaims.put("rol", usuario.getRol().getNombre());
        extraClaims.put("empresaId", usuario.getEmpresa().getId());

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(usuario.getCorreo())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 horas
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    // Método para extraer la información después
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Método rápido para los controladores
    public Integer obtenerEmpresaIdDeToken(String token) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
        return extractClaims(jwt).get("empresaId", Integer.class);
    }
}