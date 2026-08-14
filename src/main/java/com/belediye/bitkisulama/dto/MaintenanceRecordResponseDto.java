package com.belediye.bitkisulama.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class MaintenanceRecordResponseDto {
    private Long id;
    private Long deviceId;
    private LocalDate maintenanceDate;
    private LocalDate nextMaintenanceDate;
    private String description;
    private String performedBy;
    private LocalDateTime createdAt;
}
