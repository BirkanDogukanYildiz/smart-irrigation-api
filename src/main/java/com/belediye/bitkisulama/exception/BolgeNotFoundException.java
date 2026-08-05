package com.belediye.bitkisulama.exception;

public class BolgeNotFoundException extends RuntimeException {
    public BolgeNotFoundException(Long id) {
        super(id + " numaralı bölge bulunamadı!");
    }
}