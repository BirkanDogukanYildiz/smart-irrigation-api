package com.belediye.bitkisulama.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
@Slf4j
@RestControllerAdvice // tüm controllerı dinler.
public class GlobalExceptionHandler {
    // GlobalExceptionHandler hiçbir controllera bağlı değildir. Merkezi bir gözcü
// Yeni controller açsan dahi hepsi otomatik bu handlerdan faydalanır.
    @ExceptionHandler(DeviceNotFoundException.class)
    public ResponseEntity<String> handleDeviceNotFound(DeviceNotFoundException ex) {
        log.warn("Cihaz bulunamadı hatası: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> hatalar = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                hatalar.put(error.getField(), error.getDefaultMessage())
        );
        log.warn("Validasyon hatası: {}", hatalar);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(hatalar);
    }

    @ExceptionHandler(BolgeNotFoundException.class)
    public ResponseEntity<String> handleBolgeNotFound(BolgeNotFoundException ex) {
        log.warn("Bölge bulunamadı hatası: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<String> handleUsernameAlreadyExists(UsernameAlreadyExistsException ex) {
        log.warn("Kullanıcı adı çakışması: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    // Örn: "arızalı" işaretlerken açıklama girilmemesi gibi iş kuralı ihlalleri
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Geçersiz istek: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    // Kullanıcı adı/şifre hatalıysa artık 500 yerine 401 Unauthorized dönüyor
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<String> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Kimlik doğrulama hatası: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Kullanıcı adı veya şifre hatalı.");
    }
    @ExceptionHandler(BolgeSilinemezException.class)
    public ResponseEntity<String> handleBolgeSilinemez(BolgeSilinemezException ex) {
        log.warn("Bölge silme engellendi: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
}