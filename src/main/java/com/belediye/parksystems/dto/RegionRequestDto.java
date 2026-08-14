package com.belediye.parksystems.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegionRequestDto {

    // İlçe numarası artık ELLE girilmiyor: var olan bir ilçe seçilirse o ilçenin
    // numarası yeniden kullanılır, yeni bir ilçe adı girilirse sistem otomatik
    // numara atar (bkz. RegionService.resolveDistrictNo).
    @NotBlank(message = "İlçe adı boş olamaz!")
    private String districtName;

    // regionNo artık burada YOK: sistem tarafından otomatik atanıyor (RegionService.saveRegion)

    @NotBlank(message = "Bölge adı boş olamaz!")
    private String regionName;

    // Park alanı numarası da aynı şekilde ELLE girilmiyor (bkz. RegionService.resolveParkAlaniNo).
    @NotBlank(message = "Park alanı adı boş olamaz!")
    private String irrigationAreaName;

    private String description;

    // Opsiyonel: bölge oluşturulurken/güncellenirken doğrudan bir baş bahçivan atanabilir.
    // Boş bırakılırsa bölge "sahipsiz" kalır, daha sonra ayrı bir uçtan (assign-headgardener) atanabilir.
    private Long headGardenerId;

    // Opsiyonel: normalde ayrı /boundary endpoint'inden çizilir, ama form üzerinden de
    // (ör. bölge kopyalanırken) gönderilebilsin diye burada da kabul ediliyor.
    private String boundary;
}
