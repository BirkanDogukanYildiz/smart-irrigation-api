package com.belediye.parksystems.exception;

public class RequestNotFoundException extends RuntimeException {
    public RequestNotFoundException(Long id) {
        super(id + " numaralı talep bulunamadı!");
    }
}
