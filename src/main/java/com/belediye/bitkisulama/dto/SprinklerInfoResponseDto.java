package com.belediye.bitkisulama.dto;

import com.belediye.bitkisulama.enums.Status;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SprinklerInfoResponseDto {

    private Long id;
    private RegionResponseDto region;
    private Integer deviceNo;
    private Status status;
    private Double latitude;
    private Double longitude;
    private String description;
}
