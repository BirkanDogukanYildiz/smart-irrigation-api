package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.RegionResponseDto;
import com.belediye.bitkisulama.dto.SprinklerInfoRequestDto;
import com.belediye.bitkisulama.dto.SprinklerInfoResponseDto;
import com.belediye.bitkisulama.entity.Region;
import com.belediye.bitkisulama.enums.Status;
import com.belediye.bitkisulama.entity.SprinklerInfo;
import com.belediye.bitkisulama.exception.DeviceNotFoundException;
import com.belediye.bitkisulama.repository.SprinklerInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SprinklerInfoService {

    private final SprinklerInfoRepository sprinklerInfoRepository;
    private final RegionService regionService;
    private final AuditLogService auditLogService;

    // ---- YARDIMCI (private) METODLAR ----

    private SprinklerInfo toEntity(SprinklerInfoRequestDto dto) {
        Region region = regionService.getRegionEntity(dto.getRegionId());

        SprinklerInfo entity = new SprinklerInfo();
        entity.setRegion(region);
        entity.setDeviceNo(dto.getDeviceNo());
        entity.setStatus(Status.WORKING); // yeni cihaz her zaman "çalışıyor" olarak başlar
        return entity;
    }

    private SprinklerInfoResponseDto toDto(SprinklerInfo entity) {
        Region region = entity.getRegion();
        RegionResponseDto regionDto = new RegionResponseDto(
                region.getId(), region.getDistrictNo(), region.getDistrictName(),
                region.getRegionNo(), region.getRegionName(),
                region.getIrrigationAreaNo(), region.getIrrigationAreaName(),
                region.getDescription()
        );

        SprinklerInfoResponseDto dto = new SprinklerInfoResponseDto();
        dto.setId(entity.getId());
        dto.setRegion(regionDto);
        dto.setDeviceNo(entity.getDeviceNo());
        dto.setStatus(entity.getStatus());
        dto.setDescription(entity.getDescription());
        return dto;
    }

    // ---- ASIL METODLAR ----

    @Transactional
    public SprinklerInfoResponseDto deviceSave(SprinklerInfoRequestDto dto) {
        SprinklerInfo saved = sprinklerInfoRepository.save(toEntity(dto));
        log.info("Yeni cihaz kaydedildi: id={}, regionId={}", saved.getId(), dto.getRegionId());
        return toDto(saved);
    }

    @Transactional
    public List<SprinklerInfoResponseDto> deviceSaveAll(List<SprinklerInfoRequestDto> newSaveAll) {
        List<SprinklerInfo> entities = newSaveAll.stream()
                .map(this::toEntity)
                .toList();

        List<SprinklerInfo> saved = sprinklerInfoRepository.saveAll(entities);

        return saved.stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SprinklerInfoResponseDto> sprinklerDeviceGeneral() {
        return sprinklerInfoRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void deviceDelete(Long id) {
        if (sprinklerInfoRepository.existsById(id)) {
            sprinklerInfoRepository.deleteById(id);
            log.info("Cihaz silindi: id={}", id);
        } else {
            log.warn("Silinmek istenen cihaz bulunamadı: id={}", id);
            throw new DeviceNotFoundException(id);
        }
    }

    @Transactional
    public SprinklerInfoResponseDto deviceUpdate(Long id, SprinklerInfoRequestDto updatedInfo) {
        SprinklerInfo devicePresent = sprinklerInfoRepository.findById(id)
                .orElseThrow(() -> new DeviceNotFoundException(id));

        Region region = regionService.getRegionEntity(updatedInfo.getRegionId());
        devicePresent.setRegion(region);
        devicePresent.setDeviceNo(updatedInfo.getDeviceNo());

        SprinklerInfo saved = sprinklerInfoRepository.save(devicePresent);
        log.info("Cihaz güncellendi: id={}", saved.getId());
        return toDto(saved);
    }

    @Transactional
    public SprinklerInfoResponseDto updateStatus(Long id, Status newStatus, String description) {
        SprinklerInfo device = sprinklerInfoRepository.findById(id)
                .orElseThrow(() -> new DeviceNotFoundException(id));
        if (newStatus == Status.FAULTY && (description == null || description.isBlank())) {
            throw new IllegalArgumentException("Cihazı arızalı olarak işaretlerken açıklama girmek zorunludur!");
        }
        device.setStatus(newStatus);
        // Cihaz "çalışıyor" olarak işaretlenince eski arıza açıklaması temizlenir
        device.setDescription(newStatus == Status.FAULTY ? description : null);
        SprinklerInfo saved = sprinklerInfoRepository.save(device);
        log.info("Cihaz durumu güncellendi: id={}, newStatus={}", saved.getId(), newStatus);
        // LOGLAMA
        String islemDetayi = device.getDeviceNo() + " numaralı cihazın durumu " + newStatus.name() + " olarak değiştirildi.";
        if (newStatus == Status.FAULTY) {
            islemDetayi += " Sebep: " + description;
        }
        auditLogService.logAction("CİHAZ_DURUM_GÜNCELLEME", islemDetayi);
        return toDto(saved);
    }

    public SprinklerInfoResponseDto deviceInfo(Long id) {
        SprinklerInfo entity = sprinklerInfoRepository.findById(id)
                .orElseThrow(() -> new DeviceNotFoundException(id));
        return toDto(entity);
    }

}
