package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.RegionRequestDto;
import com.belediye.bitkisulama.dto.RegionResponseDto;
import com.belediye.bitkisulama.entity.Region;
import com.belediye.bitkisulama.entity.User;
import com.belediye.bitkisulama.enums.Role;
import com.belediye.bitkisulama.exception.RegionNotFoundException;
import com.belediye.bitkisulama.exception.RegionCanNotDeleteException;
import com.belediye.bitkisulama.repository.RegionRepository;
import com.belediye.bitkisulama.repository.SprinklerInfoRepository;
import com.belediye.bitkisulama.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegionService {

    private final RegionRepository regionRepository;
    private final SprinklerInfoRepository sprinklerInfoRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    private RegionResponseDto toDto(Region entity) {
        User headGardener = entity.getHeadGardener();
        return new RegionResponseDto(
                entity.getId(),
                entity.getDistrictNo(),
                entity.getDistrictName(),
                entity.getRegionNo(),
                entity.getRegionName(),
                entity.getIrrigationAreaNo(),
                entity.getIrrigationAreaName(),
                entity.getDescription(),
                headGardener != null ? headGardener.getId() : null,
                headGardener != null ? headGardener.getUsername() : null,
                entity.getBoundary()
        );
    }

    private String regionLabel(Region r) {
        return r.getRegionName() + " (" + r.getDistrictName() + ")";
    }

    // Bölge numarasını sistem otomatik üretir: mevcut en büyük numara + 1
    private Integer nextRegionNo() {
        Integer maxNo = regionRepository.findMaxRegionNo();
        return (maxNo == null ? 0 : maxNo) + 1;
    }

    // ---- GÖRÜNÜRLÜK (YETKİ) MANTIĞI ----
    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return null;
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }

    public List<Region> getVisibleRegionEntities() {
        User current = getCurrentUser();
        if (current == null || current.getRole() == null) return List.of();

        return switch (current.getRole()) {
            case ADMIN -> regionRepository.findAll();
            case HEADGARDENER -> regionRepository.findByHeadGardenerId(current.getId());
            case GARDENER -> {
                if (current.getHeadGardener() == null) yield List.of();
                yield regionRepository.findByHeadGardenerId(current.getHeadGardener().getId());
            }
        };
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
        entity.setHeadGardener(resolveHeadGardener(dto.getHeadGardenerId()));
        entity.setBoundary(dto.getBoundary());

        Region saved = regionRepository.save(entity);
        log.info("Yeni bölge kaydedildi: id={}, regionNo={} (otomatik), regionName={}",
                saved.getId(), saved.getRegionNo(), saved.getRegionName());

        auditLogService.logAction(
                AuditActions.BOLGE_OLUSTURULDU,
                AuditActions.KAYNAK_BOLGE,
                saved.getId(),
                regionLabel(saved) + " sisteme eklendi.",
                null,
                regionLabel(saved)
        );
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<RegionResponseDto> listRegions() {
        return getVisibleRegionEntities().stream()
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

        String oldLabel = regionLabel(existingRegion);

        // regionNo'ya dokunulmuyor: bir kez otomatik atandıktan sonra sabit kalır
        existingRegion.setDistrictNo(dto.getDistrictNo());
        existingRegion.setDistrictName(dto.getDistrictName());
        existingRegion.setRegionName(dto.getRegionName());
        existingRegion.setIrrigationAreaNo(dto.getIrrigationAreaNo());
        existingRegion.setIrrigationAreaName(dto.getIrrigationAreaName());
        existingRegion.setDescription(dto.getDescription());
        existingRegion.setHeadGardener(resolveHeadGardener(dto.getHeadGardenerId()));
        // Not: boundary burada BİLİNÇLİ OLARAK dokunulmuyor; sınır SADECE updateBoundary() ile değişir.

        Region saved = regionRepository.save(existingRegion);
        log.info("Bölge güncellendi: id={}", saved.getId());

        auditLogService.logAction(
                AuditActions.BOLGE_GUNCELLENDI,
                AuditActions.KAYNAK_BOLGE,
                saved.getId(),
                "Bölge bilgileri güncellendi.",
                oldLabel,
                regionLabel(saved)
        );
        return toDto(saved);
    }

    @Transactional
    public RegionResponseDto assignHeadGardener(Long regionId, Long headGardenerId) {
        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new RegionNotFoundException(regionId));

        String oldHeadGardener = region.getHeadGardener() != null ? region.getHeadGardener().getUsername() : "Atanmadı";

        region.setHeadGardener(resolveHeadGardener(headGardenerId));
        Region saved = regionRepository.save(region);

        String newHeadGardener = saved.getHeadGardener() != null ? saved.getHeadGardener().getUsername() : "Atanmadı";
        log.info("Bölgeye baş bahçivan atandı: regionId={}, headGardenerId={}", regionId, headGardenerId);

        auditLogService.logAction(
                AuditActions.BOLGE_GUNCELLENDI,
                AuditActions.KAYNAK_BOLGE,
                saved.getId(),
                regionLabel(saved) + " bölgesinin baş bahçivan ataması değiştirildi.",
                "Baş Bahçivan: " + oldHeadGardener,
                "Baş Bahçivan: " + newHeadGardener
        );
        return toDto(saved);
    }

    @Transactional
    public RegionResponseDto updateBoundary(Long regionId, String boundary) {
        Region region = regionRepository.findById(regionId)
                .orElseThrow(() -> new RegionNotFoundException(regionId));

        boolean hadBoundary = region.getBoundary() != null;
        region.setBoundary(boundary);
        Region saved = regionRepository.save(region);

        log.info("Bölge sınırı (zone) güncellendi: regionId={}, boundary={}",
                regionId, boundary == null ? "kaldırıldı" : "kaydedildi");

        auditLogService.logAction(
                AuditActions.BOLGE_GUNCELLENDI,
                AuditActions.KAYNAK_BOLGE,
                saved.getId(),
                regionLabel(saved) + " bölgesinin harita sınırı " + (boundary == null ? "kaldırıldı." : "güncellendi."),
                hadBoundary ? "Sınır: mevcuttu" : "Sınır: yoktu",
                boundary != null ? "Sınır: güncellendi" : "Sınır: kaldırıldı"
        );
        return toDto(saved);
    }

    private User resolveHeadGardener(Long headGardenerId) {
        if (headGardenerId == null) return null;
        User headGardener = userRepository.findById(headGardenerId)
                .orElseThrow(() -> new IllegalArgumentException("Baş bahçivan bulunamadı: id=" + headGardenerId));
        if (headGardener.getRole() != Role.HEADGARDENER) {
            throw new IllegalArgumentException("'" + headGardener.getUsername() + "' bir baş bahçivan değil, bölgeye atanamaz!");
        }
        return headGardener;
    }

    @Transactional
    public void deleteRegion(Long id) {
        Region region = regionRepository.findById(id)
                .orElseThrow(() -> new RegionNotFoundException(id));

        long linkedDeviceCount = sprinklerInfoRepository.countByRegionId(id);
        if (linkedDeviceCount > 0) {
            throw new RegionCanNotDeleteException(id, linkedDeviceCount);
        }

        String label = regionLabel(region);
        regionRepository.delete(region);
        log.info("Bölge silindi: id={}, regionName={}", region.getId(), region.getRegionName());

        auditLogService.logAction(
                AuditActions.BOLGE_SILINDI,
                AuditActions.KAYNAK_BOLGE,
                id,
                label + " sistemden silindi.",
                label,
                null
        );
    }

    // SprinklerInfoService'in kullanacağı, Entity dönen yardımcı metod
    public Region getRegionEntity(Long id) {
        return regionRepository.findById(id)
                .orElseThrow(() -> new RegionNotFoundException(id));
    }
}
