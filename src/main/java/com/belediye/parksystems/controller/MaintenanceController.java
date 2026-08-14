package com.belediye.parksystems.controller;

import com.belediye.parksystems.dto.MaintenanceRecordRequestDto;
import com.belediye.parksystems.dto.MaintenanceRecordResponseDto;
import com.belediye.parksystems.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    // Kayıt ekleme: cihaz durumu güncelleme ile AYNI rol seti (ADMIN/GARDENER/HEADGARDENER,
    // bkz. SecurityConfig /api/devices/status/**) — bakım da sahadaki bahçivanın günlük
    // yaptığı operasyonel bir iş, arıza bildirmekle aynı yetki düzeyinde.
    @PostMapping("/{deviceId}")
    public MaintenanceRecordResponseDto addRecord(@PathVariable Long deviceId, @Valid @RequestBody MaintenanceRecordRequestDto dto) {
        return maintenanceService.addRecord(deviceId, dto);
    }

    @GetMapping("/{deviceId}")
    public List<MaintenanceRecordResponseDto> getHistory(@PathVariable Long deviceId) {
        return maintenanceService.getHistory(deviceId);
    }
}
