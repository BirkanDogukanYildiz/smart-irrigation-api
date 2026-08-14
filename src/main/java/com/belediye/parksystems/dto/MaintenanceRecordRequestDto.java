package com.belediye.parksystems.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MaintenanceRecordRequestDto {

    @NotNull(message = "Bakım tarihi boş olamaz!")
    private LocalDate maintenanceDate;

    // Opsiyonel
    private LocalDate nextMaintenanceDate;

    private String description;
}
