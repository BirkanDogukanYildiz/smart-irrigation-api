package com.belediye.parksystems.service;

// İşlem geçmişinde kullanılan işlem türü ve kaynak türü sabitleri.
// Amaç: farklı servislerin birbirinden bağımsız, birbirini tutmayan string'ler
// yazmasını önlemek (typo riski) ve frontend'deki filtre/renk eşlemesiyle birebir
// aynı değerleri garanti etmek.
//
// NOT: Burada SADECE sistemde gerçekten var olan işlemler tanımlı. "Rol değiştirildi"
// (ayrı bir rol güncelleme uç noktası yok — rol sadece kullanıcı oluşturulurken
// belirleniyor) ve "Sulama başlatıldı/durduruldu" (sistem sulamayı otomatik
// tetiklemiyor/durdurmuyor, sadece cihaz durumunu izliyor) BİLİNÇLİ OLARAK
// eklenmedi; gerçekte olmayan işlemler için sahte log türü üretmek yanıltıcı olur.
public final class AuditActions {

    private AuditActions() {}

    // Kimlik doğrulama
    public static final String GIRIS_YAPILDI = "Giriş yapıldı";
    public static final String CIKIS_YAPILDI = "Çıkış yapıldı";

    // Cihaz / ekipman
    public static final String CIHAZ_OLUSTURULDU = "Cihaz oluşturuldu";
    public static final String CIHAZ_GUNCELLENDI = "Cihaz güncellendi";
    public static final String CIHAZ_SILINDI = "Cihaz silindi";
    public static final String CIHAZ_KONUMU_GUNCELLENDI = "Cihaz konumu güncellendi";

    // Arıza (cihaz durumu FAULTY<->WORKING geçişleri, sistemdeki tek gerçek "durum değişimi")
    public static final String ARIZA_OLUSTURULDU = "Arıza oluşturuldu";
    public static final String ARIZA_GUNCELLENDI = "Arıza güncellendi";
    public static final String ARIZA_KAPATILDI = "Arıza kapatıldı";

    // Bakım (yeni, gerçek bir özellik olarak eklendi — bkz. MaintenanceService)
    public static final String BAKIM_KAYDI_EKLENDI = "Bakım kaydı eklendi";

    // Vatandaş talebi (kimlik doğrulama gerektirmeden /api/public/requests üzerinden oluşturulur)
    public static final String TALEP_OLUSTURULDU = "Talep oluşturuldu";
    // Talep durum geçişi (İncelenmedi ⇄ İnceleniyor ⇄ İncelendi, iki yönlü) — eski
    // TALEP_INCELENDI sabiti bilinçli olarak KALDIRILMADI/DEĞİŞTİRİLMEDİ diye
    // düşünülebilir ama bu sabit hiçbir persisted veride kullanılmıyor (AuditLog'un
    // action alanı sadece görüntüleme metni, enum değil), bu yüzden serbestçe
    // genelleştirildi — eski log kayıtları da zaten kendi eski metnini korur.
    public static final String TALEP_DURUM_DEGISTI = "Talep durumu değiştirildi";

    // Bölge
    public static final String BOLGE_OLUSTURULDU = "Bölge oluşturuldu";
    public static final String BOLGE_GUNCELLENDI = "Bölge güncellendi";
    public static final String BOLGE_SILINDI = "Bölge silindi";

    // Kullanıcı
    public static final String KULLANICI_OLUSTURULDU = "Kullanıcı oluşturuldu";
    public static final String KULLANICI_GUNCELLENDI = "Kullanıcı güncellendi";
    public static final String KULLANICI_SILINDI = "Kullanıcı silindi";

    // Kaynak türleri (resourceType)
    public static final String KAYNAK_AUTH = "AUTH";
    public static final String KAYNAK_CIHAZ = "CIHAZ";
    public static final String KAYNAK_BOLGE = "BOLGE";
    public static final String KAYNAK_KULLANICI = "KULLANICI";
    public static final String KAYNAK_TALEP = "TALEP";
}
