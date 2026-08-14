package com.belediye.parksystems.exception;

public class UsernameAlreadyExistsException extends RuntimeException {
    public UsernameAlreadyExistsException(String username) {
        super("'" + username + "' kullanıcı adı zaten kayıtlı!");
    }
}
