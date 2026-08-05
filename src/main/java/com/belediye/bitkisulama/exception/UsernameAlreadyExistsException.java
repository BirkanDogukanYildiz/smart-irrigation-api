package com.belediye.bitkisulama.exception;

public class UsernameAlreadyExistsException extends RuntimeException {
    public UsernameAlreadyExistsException(String username) {
        super("'" + username + "' kullanıcı adı zaten kayıtlı!");
    }
}
