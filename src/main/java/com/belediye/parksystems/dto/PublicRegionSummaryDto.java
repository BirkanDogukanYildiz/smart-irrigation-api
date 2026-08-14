package com.belediye.parksystems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Vatandaşa açık bölge listesi için minimal DTO.
// DİKKAT: konum (lat/lng), baş bahçivan bilgisi, cihaz numarası gibi hiçbir
// hassas/iç alan buraya EKLENMEMELİ — sadece isim + toplam ekipman sayısı.
@Getter
@Setter
@AllArgsConstructor
public class PublicRegionSummaryDto {
    private String regionName;
    private String districtName;
    private long assetCount;
}
