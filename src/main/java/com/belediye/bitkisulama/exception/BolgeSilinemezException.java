package com.belediye.bitkisulama.exception;

public class BolgeSilinemezException extends RuntimeException {
    public BolgeSilinemezException(Long bolgeId, long cihazSayisi) {
        super(bolgeId + " numaralı bölge silinemez: bu bölgeye bağlı " + cihazSayisi +
                " adet sulama cihazı var. Önce o cihazları silmen veya başka bir bölgeye taşıman gerekiyor.");
    }
}