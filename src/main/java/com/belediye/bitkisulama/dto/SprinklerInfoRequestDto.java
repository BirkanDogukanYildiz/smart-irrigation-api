package com.belediye.bitkisulama.dto;

import com.belediye.bitkisulama.enums.AssetType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SprinklerInfoRequestDto {

    @NotNull(message = "Bölge id boş olamaz!")
    private Long regionId;

    @NotNull(message = "Sulama cihaz numarası null olamaz!")
    @Positive(message = "Sulama cihaz numarası pozitif olmalı!")
    private Integer deviceNo;

    private Double latitude;
    private Double longitude;

    // Opsiyonel: gönderilmezse servis katmanında SULAMA_CIHAZI varsayılır,
    // böylece eski frontend çağrıları (bu alanı hiç göndermeyenler) kırılmaz.
    private AssetType assetType;
}
