package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.SprinklerDurumUpdateDto;
import com.belediye.bitkisulama.dto.SprinklerInfoRequestDto;
import com.belediye.bitkisulama.dto.SprinklerInfoResponseDto;
import com.belediye.bitkisulama.service.SprinklerInfoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/genel-tablo")
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
    public List<SprinklerInfoResponseDto> sprinklerDeviceGenaralTable() {
        return sprinklerInfoService.sprinklerDeviceGeneral();
    }
    @DeleteMapping("/delete/{id}")
    public String deviceDelete(@PathVariable Long id) {
        sprinklerInfoService.deviceDelete(id);
        return id + " numaralı cihaz başarıyla silindi.";
    }
    @PutMapping("/update/{id}")
    public SprinklerInfoResponseDto deviceUpdate(@PathVariable Long id, @Valid @RequestBody SprinklerInfoRequestDto guncelBilgiler) {
        return sprinklerInfoService.deviceUpdate(id, guncelBilgiler);
    }
    // Bahçivanın kullandığı endpoint: durumu (ARIZALI / CALISIYOR) ve arızaysa açıklamayı günceller
    @PutMapping("/durum/{id}")
    public SprinklerInfoResponseDto deviceDurumUpdate(@PathVariable Long id, @Valid @RequestBody SprinklerDurumUpdateDto durumDto) {
        return sprinklerInfoService.updateDurum(id, durumDto.getDurum(), durumDto.getAciklama());
    }
    @GetMapping("/device-info/{id}")
    public SprinklerInfoResponseDto deviceInfo(@PathVariable Long id) {

        return sprinklerInfoService.deviceInfo(id);
    }
}