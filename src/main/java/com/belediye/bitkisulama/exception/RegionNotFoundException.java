package com.belediye.bitkisulama.exception;

public class RegionNotFoundException extends RuntimeException {
    public RegionNotFoundException(Long id) {
        super(id + " numaralı bölge bulunamadı!");
    }
}