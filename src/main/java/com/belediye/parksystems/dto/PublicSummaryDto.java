package com.belediye.parksystems.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

// Vatandaşa açık, kimlik doğrulama gerektirmeyen özet. DİKKAT: kullanıcı sayısı,
// cihaz numarası, konum, kullanıcı adı gibi hiçbir iç/hassas alan buraya EKLENMEMELİ.
@Getter
@Setter
public class PublicSummaryDto {
    private long totalAssets;
    private long totalRegions;
    private long workingCount;
    private long faultyCount;
    private double workingRatioPercent;
    private Map<String, Long> assetTypeBreakdown;

    // 3.2 madde 5: bölge bazlı basit liste — sadece isim + toplam ekipman sayısı.
    // Konum, baş bahçivan gibi hassas/iç bilgi kasıtlı olarak yok.
    private List<PublicRegionSummaryDto> regions;
}
