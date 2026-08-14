package com.belediye.parksystems.exception;

// Login rate limiter tarafından, izin verilen başarısız deneme sayısı aşıldığında fırlatılır.
// GlobalExceptionHandler bunu 429 Too Many Requests olarak döner.
public class TooManyLoginAttemptsException extends RuntimeException {
    public TooManyLoginAttemptsException(long secondsRemaining) {
        super("Çok fazla başarısız giriş denemesi. Lütfen " + secondsRemaining + " saniye sonra tekrar deneyin.");
    }
}
