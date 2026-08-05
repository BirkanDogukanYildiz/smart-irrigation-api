package com.belediye.bitkisulama.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

// Giriş yapmış ama bu işlem için yetkisi olmayan kullanıcılar (örn. BAHCIVAN'ın
// ADMIN'e özel bir uç noktaya erişmeye çalışması) için düzgün JSON + 403 döner.
@Slf4j
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request,
                        HttpServletResponse response,
                        AccessDeniedException accessDeniedException) throws IOException {

        log.warn("Yetkisiz işlem denemesi: {} {} -> {}",
                request.getMethod(), request.getRequestURI(), accessDeniedException.getMessage());

        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("application/json;charset=UTF-8");

        String json = "{"
                + "\"timestamp\":\"" + Instant.now() + "\","
                + "\"status\":403,"
                + "\"error\":\"Forbidden\","
                + "\"message\":\"Bu işlemi yapmaya yetkiniz yok.\","
                + "\"path\":\"" + request.getRequestURI().replace("\"", "\\\"") + "\""
                + "}";

        response.getWriter().write(json);
    }
}
