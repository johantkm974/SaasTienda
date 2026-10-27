package com.example.demo.service;

import com.example.demo.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    public String generateToken(Usuario usuario) {
        Map<String, Object> extraClaims = new HashMap<>();

        extraClaims.put("userId", usuario.getId());
        String rol = usuario.getRol() != null ? usuario.getRol().getNombre().toUpperCase() : "VENDEDOR";
        extraClaims.put("rol", rol);
        extraClaims.put("empresaId", usuario.getEmpresa() != null ? usuario.getEmpresa().getId() : null);

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(usuario.getCorreo())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Integer obtenerEmpresaIdDeToken(String token) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
        Claims claims = extractClaims(jwt);
        return claims.get("empresaId", Integer.class);
    }

    public Integer obtenerUsuarioIdDeToken(String token) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
        Claims claims = extractClaims(jwt);
        Integer userId = claims.get("userId", Integer.class);
        if (userId == null) {
            throw new RuntimeException("Token inválido: falta userId");
        }
        return userId;
    }

    public String obtenerRolDeToken(String token) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
        Claims claims = extractClaims(jwt);
        String rol = claims.get("rol", String.class);
        return rol != null ? rol.toUpperCase() : "VENDEDOR";
    }

    public boolean esSupremo(String token) {
        return "SUPREMO".equals(obtenerRolDeToken(token));
    }

    public String obtenerRolActual() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .map(a -> a.replace("ROLE_", ""))
                .orElse(null);
    }

    public String generateToken(String subject, String rol) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("rol", rol);
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String subject, String rol) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("rol", rol);
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractSubject(String token) {
        String jwt = token.startsWith("Bearer ") ? token.substring(7) : token;
        return extractClaims(jwt).getSubject();
    }
}
