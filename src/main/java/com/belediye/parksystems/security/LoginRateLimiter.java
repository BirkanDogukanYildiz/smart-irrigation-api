package com.belediye.parksystems.security;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

// Basit, bellek içi (in-memory) login rate limiter. Harici bir kütüphane/servis
// (Redis, Bucket4j vb.) EKLEMEDEN, mevcut mimariye en az müdahaleyle brute-force
// saldırılarını yavaşlatmak için yazıldı.
//
// Not: Tek instance'lık bir uygulama için yeterlidir. Uygulama birden fazla backend
// instance'ı ile (yatay ölçekleme) çalıştırılırsa bu sayaçlar instance'lar arasında
// paylaşılmaz — o durumda paylaşımlı bir store'a (Redis gibi) taşınması gerekir.
// Bu, mevcut projenin ölçeğinde kapsam dışı bırakıldı.
@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MILLIS = 5 * 60 * 1000L;   // 5 dakikalık deneme penceresi
    private static final long BLOCK_MILLIS = 5 * 60 * 1000L;    // penceresi dolan IP için engelleme süresi

    private final ConcurrentMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    // key: genellikle istemci IP'si. Login denemesinden ÖNCE çağrılır.
    // Bloklanmışsa kalan saniyeyi (>0) döner, bloklanmamışsa 0 döner.
    public long getBlockedSecondsRemaining(String key) {
        Attempt a = attempts.get(key);
        if (a == null) return 0;
        synchronized (a) {
            long now = System.currentTimeMillis();
            if (a.blockedUntil > now) {
                return (a.blockedUntil - now) / 1000 + 1;
            }
            return 0;
        }
    }

    public void recordFailure(String key) {
        Attempt a = attempts.computeIfAbsent(key, k -> new Attempt());
        synchronized (a) {
            long now = System.currentTimeMillis();
            if (now - a.windowStart > WINDOW_MILLIS) {
                // Pencere dolmuş, sayaç sıfırdan başlar
                a.windowStart = now;
                a.count = 0;
            }
            a.count++;
            if (a.count >= MAX_ATTEMPTS) {
                a.blockedUntil = now + BLOCK_MILLIS;
            }
        }
    }

    // Başarılı girişte sayaç tamamen temizlenir — geçmiş başarısız denemeler
    // sonraki girişleri asla etkilemez.
    public void recordSuccess(String key) {
        attempts.remove(key);
    }

    private static class Attempt {
        int count = 0;
        long windowStart = System.currentTimeMillis();
        long blockedUntil = 0;
    }
}
