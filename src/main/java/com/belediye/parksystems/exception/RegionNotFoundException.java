package com.belediye.parksystems.exception;

public class RegionNotFoundException extends RuntimeException {
    public RegionNotFoundException(Long id) {
        super(id + " numaralı bölge bulunamadı!");
    }
}