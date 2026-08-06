package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.RegionRequestDto;
import com.belediye.bitkisulama.dto.RegionResponseDto;
import com.belediye.bitkisulama.entity.Region;
import com.belediye.bitkisulama.exception.RegionNotFoundException;
import com.belediye.bitkisulama.exception.RegionCanNotDeleteException;
import com.belediye.bitkisulama.repository.RegionRepository;
import com.belediye.bitkisulama.repository.SprinklerInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegionService {

    private final RegionRepository regionRepository;
    private final SprinklerInfoRepository sprinklerInfoRepository;

    private RegionResponseDto toDto(Region entity) {
        return new RegionResponseDto(
                entity.getId(),
                entity.getDistrictNo(),
                entity.getDistrictName(),
                entity.getRegionNo(),
                entity.getRegionName(),
                entity.getIrrigationAreaNo(),
                entity.getIrrigationAreaName(),
                entity.getDescription()
        );
    }

    // Bölge numarasını sistem otomatik üretir: mevcut en büyük numara + 1
    private Integer nextRegionNo() {
        Integer maxNo = regionRepository.findMaxRegionNo();
        return (maxNo == null ? 0 : maxNo) + 1;
    }

    @Transactional
    public RegionResponseDto saveRegion(RegionRequestDto dto) {
        Region entity = new Region();
        entity.setDistrictNo(dto.getDistrictNo());
        entity.setDistrictName(dto.getDistrictName());
        entity.setRegionNo(nextRegionNo()); // <-- otomatik atama, kullanıcıdan alınmıyor
        entity.setRegionName(dto.getRegionName());
        entity.setIrrigationAreaNo(dto.getIrrigationAreaNo());
        entity.setIrrigationAreaName(dto.getIrrigationAreaName());
        entity.setDescription(dto.getDescription());

        Region saved = regionRepository.save(entity);
        log.info("Yeni bölge kaydedildi: id={}, regionNo={} (otomatik), regionName={}",
                saved.getId(), saved.getRegionNo(), saved.getRegionName());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<RegionResponseDto> listRegions() {
        return regionRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public RegionResponseDto getRegionInfo(Long id) {
        Region entity = regionRepository.findById(id)
                .orElseThrow(() -> new RegionNotFoundException(id));
        return toDto(entity);
    }

    @Transactional
    public RegionResponseDto updateRegion(Long id, RegionRequestDto dto) {
        Region existingRegion = regionRepository.findById(id)
                .orElseThrow(() -> new RegionNotFoundException(id));

        // regionNo'ya dokunulmuyor: bir kez otomatik atandıktan sonra sabit kalır
        existingRegion.setDistrictNo(dto.getDistrictNo());
        existingRegion.setDistrictName(dto.getDistrictName());
        existingRegion.setRegionName(dto.getRegionName());
        existingRegion.setIrrigationAreaNo(dto.getIrrigationAreaNo());
        existingRegion.setIrrigationAreaName(dto.getIrrigationAreaName());
        existingRegion.setDescription(dto.getDescription());

        Region saved = regionRepository.save(existingRegion);
        log.info("Bölge güncellendi: id={}", saved.getId());
        return toDto(saved);
    }

    @Transactional
    public void deleteRegion(Long id) {
        Region region = regionRepository.findById(id)
                .orElseThrow(() -> new RegionNotFoundException(id));

        long linkedDeviceCount = sprinklerInfoRepository.countByRegionId(id);
        if (linkedDeviceCount > 0) {
            throw new RegionCanNotDeleteException(id, linkedDeviceCount);
        }

        regionRepository.delete(region);
        log.info("Bölge silindi: id={}, regionName={}", region.getId(), region.getRegionName());
    }
    // SprinklerInfoService'in kullanacağı, Entity dönen yardımcı metod
    public Region getRegionEntity(Long id) {
        return regionRepository.findById(id)
                .orElseThrow(() -> new RegionNotFoundException(id));
    }
}
