package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.RegionRequestDto;
import com.belediye.bitkisulama.dto.RegionResponseDto;
import com.belediye.bitkisulama.service.RegionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/region")
public class RegionController {

    private final RegionService regionService;

    public RegionController(RegionService regionService) {
        this.regionService = regionService;
    }

    @PostMapping("/save")
    public RegionResponseDto saveRegion(@Valid @RequestBody RegionRequestDto dto) {
        return regionService.saveRegion(dto);
    }

    @GetMapping("/list")
    public List<RegionResponseDto> listRegions() {
        return regionService.listRegions();
    }

    @GetMapping("/{id}")
    public RegionResponseDto getRegionInfo(@PathVariable Long id) {
        return regionService.getRegionInfo(id);
    }

    @PutMapping("/update/{id}")
    public RegionResponseDto updateRegion(@PathVariable Long id, @Valid @RequestBody RegionRequestDto dto) {
        return regionService.updateRegion(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteRegion(@PathVariable Long id) {
        regionService.deleteRegion(id);
        return id + " numaralı bölge başarıyla silindi.";
    }
}
