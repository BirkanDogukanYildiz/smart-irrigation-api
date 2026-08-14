package com.belediye.parksystems.controller;

import com.belediye.parksystems.dto.SprinklerStatusUpdateDto;
import com.belediye.parksystems.dto.SprinklerInfoRequestDto;
import com.belediye.parksystems.dto.SprinklerInfoResponseDto;
import com.belediye.parksystems.dto.PageResponseDto;
import com.belediye.parksystems.enums.AssetType;
import com.belediye.parksystems.enums.Status;
import com.belediye.parksystems.service.SprinklerInfoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
public class SprinklerInfoController {

    private final SprinklerInfoService sprinklerInfoService;
    public SprinklerInfoController(SprinklerInfoService sprinklerInfoService){
        this.sprinklerInfoService = sprinklerInfoService;
    }

    @PostMapping("/save")
    public SprinklerInfoResponseDto newDeviceSave(@Valid @RequestBody SprinklerInfoRequestDto newSave){
        return sprinklerInfoService.deviceSave(newSave);
    }
    @PostMapping("/save-all")
    public List<SprinklerInfoResponseDto> newDeviceSaveAll(@Valid @RequestBody List<SprinklerInfoRequestDto> newSaveAll){
        return sprinklerInfoService.deviceSaveAll(newSaveAll);
    }
    @GetMapping("/list")
    public List<SprinklerInfoResponseDto> sprinklerDeviceGeneralTable() {
        return sprinklerInfoService.sprinklerDeviceGeneral();
    }

    // Server-side sayfalama/filtreleme/arama. "Arızalar" görünümü için ayrı bir endpoint
    // yok — aynı uç nokta status=FAULTY parametresiyle çağrılır (bkz. SprinklerInfoService).
    @GetMapping("/search")
    public PageResponseDto<SprinklerInfoResponseDto> searchDevices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) AssetType assetType,
            @RequestParam(required = false) Long regionId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        return sprinklerInfoService.searchDevices(page, size, status, assetType, regionId, q, sortBy, sortDir);
    }
    @DeleteMapping("/delete/{id}")
    public String deviceDelete(@PathVariable Long id) {
        sprinklerInfoService.deviceDelete(id);
        return id + " numaralı cihaz başarıyla silindi.";
    }
    @PutMapping("/update/{id}")
    public SprinklerInfoResponseDto deviceUpdate(@PathVariable Long id, @Valid @RequestBody SprinklerInfoRequestDto updatedInfo) {
        return sprinklerInfoService.deviceUpdate(id, updatedInfo);
    }
    // Bahçivanın kullandığı endpoint: durumu (FAULTY / WORKING), arızaysa açıklamayı ve
    // arıza türünü (opsiyonel) günceller.
    @PutMapping("/status/{id}")
    public SprinklerInfoResponseDto deviceStatusUpdate(@PathVariable Long id, @Valid @RequestBody SprinklerStatusUpdateDto statusDto) {
        return sprinklerInfoService.updateStatus(id, statusDto.getStatus(), statusDto.getDescription(), statusDto.getFaultType());
    }
    @GetMapping("/device-info/{id}")
    public SprinklerInfoResponseDto deviceInfo(@PathVariable Long id) {

        return sprinklerInfoService.deviceInfo(id);
    }

    @PutMapping("/location/{id}")
    public SprinklerInfoResponseDto updateLocation(@PathVariable Long id, @RequestBody java.util.Map<String, Double> payload) {
        return sprinklerInfoService.updateLocation(id, payload.get("latitude"), payload.get("longitude"));
    }
}
