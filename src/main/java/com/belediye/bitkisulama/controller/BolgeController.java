package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.BolgeRequestDto;
import com.belediye.bitkisulama.dto.BolgeResponseDto;
import com.belediye.bitkisulama.service.BolgeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bolge")
public class BolgeController {

    private final BolgeService bolgeService;

    public BolgeController(BolgeService bolgeService) {
        this.bolgeService = bolgeService;
    }

    @PostMapping("/save")
    public BolgeResponseDto saveBolge(@Valid @RequestBody BolgeRequestDto dto) {
        return bolgeService.saveBolge(dto);
    }

    @GetMapping("/list")
    public List<BolgeResponseDto> listBolges() {
        return bolgeService.listBolges();
    }

    @GetMapping("/{id}")
    public BolgeResponseDto getBolgeInfo(@PathVariable Long id) {
        return bolgeService.getBolgeInfo(id);
    }

    @PutMapping("/update/{id}")
    public BolgeResponseDto updateBolge(@PathVariable Long id, @Valid @RequestBody BolgeRequestDto dto) {
        return bolgeService.updateBolge(id, dto);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteBolge(@PathVariable Long id) {
        bolgeService.deleteBolge(id);
        return id + " numaralı bölge başarıyla silindi.";
    }
}