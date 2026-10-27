package com.example.demo.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class TiendaContext {

    @Value("${app.tienda.empresa-id:1}")
    private Integer tiendaPorDefecto;

    public Integer empresaIdActual() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();

                String param = request.getParameter("tienda_id");
                if (param != null && !param.isBlank()) {
                    return Integer.parseInt(param);
                }

                String header = request.getHeader("X-Tienda-Id");
                if (header != null && !header.isBlank()) {
                    return Integer.parseInt(header);
                }

                if (request.getCookies() != null) {
                    for (Cookie cookie : request.getCookies()) {
                        if ("tienda_id".equals(cookie.getName())) {
                            return Integer.parseInt(cookie.getValue());
                        }
                    }
                }
            }
        } catch (Exception ignored) {
            // se usa la tienda por defecto
        }
        return tiendaPorDefecto;
    }
}
