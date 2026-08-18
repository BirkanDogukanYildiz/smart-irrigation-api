package com.belediye.parksystems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Vatandaş haritası için: personel tarafında çizilen bölge (zone) verisini AYNEN
// yeniden kullanır — ayrı bir veri modeli/sistem OLUŞTURULMADI. Sadece hassas
// olmayan alanlar dışarı veriliyor (konum/baş bahçivan/cihaz numarası yok).
//
// DİKKAT: "boundary" burada TAM OLARAK RegionResponseDto'daki ile aynı formatta
// ("[[lat,lng],[lat,lng],...]") — personel haritasıyla aynı koordinat sistemi,
// aynı parse mantığı (frontend'de tek bir ortak yardımcı fonksiyon, bkz. utils/geo.js).
@Getter
@Setter
@AllArgsConstructor
public class PublicParkDto {
    private Long id;
    private String regionName;
    private String districtName;
    private String description;
    private String boundary;
    private long assetCount;
}
