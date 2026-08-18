package com.belediye.parksystems.enums;

// DİKKAT — GERİYE DÖNÜK UYUMLULUK: Bu enum'un JPA @Enumerated(EnumType.STRING) ile
// saklandığı citizen_request.status kolonunda halihazırda "YENI" ve "INCELENDI"
// string değerleri bulunuyor olabilir (önceki sürümden kalma gerçek kayıtlar).
// Sabit isim YENI BİLİNÇLİ OLARAK DEĞİŞTİRİLMEDİ — sadece frontend'deki görünen
// etiketi "İncelenmedi" oldu (bkz. frontend/src/utils/requestTopics.js). Böylece
// eski kayıtlar hiçbir migration/veri dönüştürme gerekmeden geçerli kalmaya devam
// ediyor. Yeni INCELENIYOR durumu ARADA eklendi (üç durumlu iş akışı):
//   YENI (İncelenmedi) ⇄ INCELENIYOR (İnceleniyor) ⇄ INCELENDI (İncelendi)
// Geçişler iki yönlü de olabilir (bkz. CitizenRequestService.updateStatus) — durumlar
// arasında zorunlu tek yönlü bir sıralama YOK, personel gerektiğinde geri alabilir.
public enum RequestStatus {
    YENI,         // "İncelenmedi" (etiket) — vatandaş tarafından oluşturuldu, henüz ele alınmadı
    INCELENIYOR,  // "İnceleniyor" — bir yetkili talebi ele almaya başladı
    INCELENDI     // "İncelendi" — inceleme tamamlandı, opsiyonel bir not eklenmiş olabilir
}
