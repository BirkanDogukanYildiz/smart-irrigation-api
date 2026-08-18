package com.belediye.parksystems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Vatandaş talep formunda "Hangi park/bölge ile ilgili?" dropdown'u için minimal DTO.
// DİKKAT: konum, baş bahçivan gibi hassas/iç alanlar burada yok — sadece id (formdan
// seçim yapabilmek için) + isim.
@Getter
@Setter
@AllArgsConstructor
public class PublicRegionOptionDto {
    private Long id;
    private String regionName;
    private String districtName;
}
