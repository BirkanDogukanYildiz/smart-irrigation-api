package com.belediye.bitkisulama.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    // Gerçek projede bu, application.properties'den okunmalı ve
    // asla kod içinde sabit yazılmamalı (güvenlik riski) — şimdilik öğrenme amaçlı burada.
    private static final String SECRET_KEY =
            "bitkisulamaProjesiIcinCokGizliVeUzunBirAnahtarBuOlmali123456";

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // Token üretme
    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 saat geçerli
                .signWith(getSigningKey())
                .compact();
    }

    // Token'dan kullanıcı adını çıkarma
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Token süresi dolmuş mu kontrolü
    public boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    // Token geçerli mi kontrolü (kullanıcı adı doğru mu + süresi dolmamış mı)
    public boolean isTokenValid(String token, String username) {
        String tokenUsername = extractUsername(token);
        return tokenUsername.equals(username) && !isTokenExpired(token);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }
}