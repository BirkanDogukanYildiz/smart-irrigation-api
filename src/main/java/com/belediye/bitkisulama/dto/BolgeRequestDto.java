package com.belediye.bitkisulama.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BolgeRequestDto {

    @NotNull(message = "İlçe numarası null olamaz!")
    @Positive(message = "İlçe numarası pozitif olmalı!")
    private Integer ilceNo;

    @NotBlank(message = "İlçe adı boş olamaz!")
    private String ilceAd;

    // bolgeNo artık burada YOK: sistem tarafından otomatik atanıyor (BolgeService.saveBolge)

    @NotBlank(message = "Bölge adı boş olamaz!")
    private String bolgeAd;

    @NotNull(message = "Sulama alanı numarası null olamaz!")
    @Positive(message = "Sulama alanı numarası pozitif olmalı!")
    private Integer sulamaAlanNo;

    @NotBlank(message = "Sulama alanı adı boş olamaz!")
    private String sulamaAlanAd;

    private String aciklama;
}
