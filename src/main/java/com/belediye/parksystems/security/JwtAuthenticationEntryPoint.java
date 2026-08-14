package com.belediye.parksystems.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

// Token eksik, hatalı ya da süresi dolmuşsa Spring Security'nin varsayılan
// "403 Forbidden" (boş gövdeli) davranışı yerine, düzgün bir 401 Unauthorized
// ve açıklayıcı JSON gövde döndürür.
// Not: JSON, harici bir kütüphaneye (Jackson vb.) bağımlı olmadan elle
// oluşturuluyor; bu sayede Spring Boot/Jackson sürüm değişikliklerinden
// (örn. Jackson 3'te paketlerin com.fasterxml -> tools.jackson taşınması) etkilenmez.
@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                          HttpServletResponse response,
                          AuthenticationException authException) throws IOException {

        log.warn("Yetkisiz erişim denemesi: {} {} -> {}",
                request.getMethod(), request.getRequestURI(), authException.getMessage());

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json;charset=UTF-8");

        String message = "Bu isteği yapabilmek için geçerli bir JWT token gerekiyor. " +
                "'Authorization: Bearer <token>' başlığını eklediğinizden emin olun.";

        String json = "{"
                + "\"timestamp\":\"" + Instant.now() + "\","
                + "\"status\":401,"
                + "\"error\":\"Unauthorized\","
                + "\"message\":\"" + escapeJson(message) + "\","
                + "\"path\":\"" + escapeJson(request.getRequestURI()) + "\""
                + "}";

        response.getWriter().write(json);
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
