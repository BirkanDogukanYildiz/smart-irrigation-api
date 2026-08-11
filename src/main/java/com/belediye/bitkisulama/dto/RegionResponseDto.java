package com.belediye.bitkisulama.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegionResponseDto {

    private Long id;
    private Integer districtNo;
    private String districtName;
    private Integer regionNo;
    private String regionName;
    private Integer irrigationAreaNo;
    private String irrigationAreaName;
    private String description;

    // Bu bölgeden sorumlu baş bahçivan (admin tarafından atanır). Atanmamışsa ikisi de null gelir.
    private Long headGardenerId;
    private String headGardenerUsername;
}
