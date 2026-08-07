package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.SprinklerStatusUpdateDto;
import com.belediye.bitkisulama.dto.SprinklerInfoRequestDto;
import com.belediye.bitkisulama.dto.SprinklerInfoResponseDto;
import com.belediye.bitkisulama.service.SprinklerInfoService;
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
    @DeleteMapping("/delete/{id}")
    public String deviceDelete(@PathVariable Long id) {
        sprinklerInfoService.deviceDelete(id);
        return id + " numaralı cihaz başarıyla silindi.";
    }
    @PutMapping("/update/{id}")
    public SprinklerInfoResponseDto deviceUpdate(@PathVariable Long id, @Valid @RequestBody SprinklerInfoRequestDto updatedInfo) {
        return sprinklerInfoService.deviceUpdate(id, updatedInfo);
    }
    // Bahçivanın kullandığı endpoint: durumu (FAULTY / WORKING) ve arızaysa açıklamayı günceller
    @PutMapping("/status/{id}")
    public SprinklerInfoResponseDto deviceStatusUpdate(@PathVariable Long id, @Valid @RequestBody SprinklerStatusUpdateDto statusDto) {
        return sprinklerInfoService.updateStatus(id, statusDto.getStatus(), statusDto.getDescription());
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
