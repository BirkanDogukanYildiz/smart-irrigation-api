package com.belediye.bitkisulama.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DashboardResponseDto {
    private long totalRegions;
    private long totalDevices;
    private long workingDevices;
    private long faultyDevices;
    private long totalUsers;
}