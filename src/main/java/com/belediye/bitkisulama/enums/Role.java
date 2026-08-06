package com.belediye.bitkisulama.enums;

public enum Role {
    ADMIN,      // Her şeye tam yetkili: bölge/cihaz ekleme-silme-güncelleme, kullanıcı yönetimi
    GARDENER    // Sadece cihaz durumunu (arızalı/çalışıyor) değiştirebilir, listeleri görebilir
}
