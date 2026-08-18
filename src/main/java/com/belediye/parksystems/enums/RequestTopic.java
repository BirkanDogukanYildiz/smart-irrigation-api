package com.belediye.parksystems.enums;

// Vatandaşın talep oluştururken seçtiği konu — hem formda dropdown olarak
// sunulur hem de "Talepler" (staff) sayfasında konuya göre filtrelemeyi sağlar.
public enum RequestTopic {
    ARIZA_BILDIRIMI,   // Bir ekipmanın arızalı/bozuk olduğunu bildirme
    BAKIM_TALEBI,      // Genel bakım/onarım talebi
    TEMIZLIK,          // Temizlik ile ilgili talep/şikayet
    GUVENLIK,          // Güvenlik ile ilgili talep/şikayet
    ONERI,             // Öneri
    SIKAYET,           // Genel şikayet
    DIGER
}
