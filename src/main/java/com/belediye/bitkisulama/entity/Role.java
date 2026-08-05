package com.belediye.bitkisulama.entity;

public enum Role {
    ADMIN,      // Her şeye tam yetkili: bölge/cihaz ekleme-silme-güncelleme, kullanıcı yönetimi
    BAHCIVAN    // Sadece cihaz durumunu (arızalı/çalışıyor) değiştirebilir, listeleri görebilir
}
