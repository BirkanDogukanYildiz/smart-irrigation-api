package com.belediye.parksystems.exception;

public class RegionCanNotDeleteException extends RuntimeException {
    public RegionCanNotDeleteException(Long regionId, long deviceCount) {
        super(regionId + " numaralı bölge silinemez: bu bölgeye bağlı " + deviceCount +
                " adet sulama cihazı var. Önce o cihazları silmen veya başka bir bölgeye taşıman gerekiyor.");
    }
}
