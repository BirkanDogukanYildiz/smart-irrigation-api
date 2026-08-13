package com.belediye.bitkisulama.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegionRequestDto {

    @NotNull(message = "İlçe numarası null olamaz!")
    @Positive(message = "İlçe numarası pozitif olmalı!")
    private Integer districtNo;

    @NotBlank(message = "İlçe adı boş olamaz!")
    private String districtName;

    // regionNo artık burada YOK: sistem tarafından otomatik atanıyor (RegionService.saveRegion)

    @NotBlank(message = "Bölge adı boş olamaz!")
    private String regionName;

    @NotNull(message = "Sulama alanı numarası null olamaz!")
    @Positive(message = "Sulama alanı numarası pozitif olmalı!")
    private Integer irrigationAreaNo;

    @NotBlank(message = "Sulama alanı adı boş olamaz!")
    private String irrigationAreaName;

    private String description;

    // Opsiyonel: bölge oluşturulurken/güncellenirken doğrudan bir baş bahçivan atanabilir.
    // Boş bırakılırsa bölge "sahipsiz" kalır, daha sonra ayrı bir uçtan (assign-headgardener) atanabilir.
    private Long headGardenerId;

    // Opsiyonel: normalde ayrı /boundary endpoint'inden çizilir, ama form üzerinden de
    // (ör. bölge kopyalanırken) gönderilebilsin diye burada da kabul ediliyor.
    private String boundary;
}
