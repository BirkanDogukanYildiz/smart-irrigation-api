package com.belediye.parksystems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RegionDeviceBreakdownDto {
    private Long regionId;
    private String regionName;
    private String districtName;
    private Long totalDevices;
    private Long workingDevices;
    private Long faultyDevices;
}
