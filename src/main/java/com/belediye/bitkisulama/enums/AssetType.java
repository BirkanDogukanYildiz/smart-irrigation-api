package com.belediye.bitkisulama.enums;

// Mimari genelleme (Faz 3.1): sistem artık sadece sulama cihazlarını değil,
// genel park/bahçe ekipmanlarını da modelleyebiliyor. SprinklerInfo entity'si
// bu tür alanı ile "hangi tür ekipman" bilgisini taşıyor; entity/tablo isimleri
// bilinçli olarak DEĞİŞTİRİLMEDİ (bkz. SprinklerInfo.java üstündeki not).
public enum AssetType {
    SULAMA_CIHAZI,
    AYDINLATMA,
    BANK,
    COP_KUTUSU,
    OYUN_GRUBU,
    KAMERA,
    DIGER
}
