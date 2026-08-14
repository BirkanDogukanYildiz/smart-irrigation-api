package com.belediye.parksystems.dto;

import com.belediye.parksystems.enums.AssetType;
import com.belediye.parksystems.enums.Status;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SprinklerInfoResponseDto {

    private Long id;
    private RegionResponseDto region;
    private Integer deviceNo;
    private Status status;
    private AssetType assetType;
    private Double latitude;
    private Double longitude;
    private String description;

    // Harita pin detayı ve arıza raporu için
    private LocalDateTime createdAt;
    private LocalDateTime statusChangedAt;
    private String faultType;
    private String lastUpdatedBy;
}
