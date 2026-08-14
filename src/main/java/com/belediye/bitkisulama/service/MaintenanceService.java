package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.MaintenanceRecordRequestDto;
import com.belediye.bitkisulama.dto.MaintenanceRecordResponseDto;
import com.belediye.bitkisulama.entity.MaintenanceRecord;
import com.belediye.bitkisulama.entity.Region;
import com.belediye.bitkisulama.entity.SprinklerInfo;
import com.belediye.bitkisulama.exception.DeviceNotFoundException;
import com.belediye.bitkisulama.repository.MaintenanceRecordRepository;
import com.belediye.bitkisulama.repository.SprinklerInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final SprinklerInfoRepository sprinklerInfoRepository;
    private final RegionService regionService;
    private final AuditLogService auditLogService;

    private String getCurrentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    // Görünürlük kuralına (RegionService.getVisibleRegionEntities) BİLİNÇLİ OLARAK uyuluyor —
    // aksi halde bir kullanıcı, kendi kapsamı dışındaki bir cihazın bakım kaydını
    // ekleyebilir/görebilirdi. Bu, deviceInfo()/getRegionInfo() ile aynı desen.
    private SprinklerInfo getVisibleDeviceOrThrow(Long deviceId) {
        SprinklerInfo device = sprinklerInfoRepository.findById(deviceId)
                .orElseThrow(() -> new DeviceNotFoundException(deviceId));

        Set<Long> visibleRegionIds = regionService.getVisibleRegionEntities().stream()
                .map(Region::getId)
                .collect(Collectors.toSet());
        if (!visibleRegionIds.contains(device.getRegion().getId())) {
            throw new DeviceNotFoundException(deviceId);
        }
        return device;
    }

    @Transactional
    public MaintenanceRecordResponseDto addRecord(Long deviceId, MaintenanceRecordRequestDto dto) {
        SprinklerInfo device = getVisibleDeviceOrThrow(deviceId);

        MaintenanceRecord record = new MaintenanceRecord();
        record.setDevice(device);
        record.setMaintenanceDate(dto.getMaintenanceDate());
        record.setNextMaintenanceDate(dto.getNextMaintenanceDate());
        record.setDescription(dto.getDescription());
        record.setPerformedBy(getCurrentUsername());

        MaintenanceRecord saved = maintenanceRecordRepository.save(record);
        log.info("Bakım kaydı eklendi: deviceId={}, maintenanceDate={}", deviceId, dto.getMaintenanceDate());

        auditLogService.logAction(
                AuditActions.BAKIM_KAYDI_EKLENDI,
                AuditActions.KAYNAK_CIHAZ,
                deviceId,
                device.getAssetType() + " #" + device.getDeviceNo() + " için bakım kaydı eklendi ("
                        + dto.getMaintenanceDate() + ").",
                null,
                dto.getDescription()
        );

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceRecordResponseDto> getHistory(Long deviceId) {
        getVisibleDeviceOrThrow(deviceId); // görünürlük kontrolü + cihaz gerçekten var mı
        return maintenanceRecordRepository.findByDeviceIdOrderByMaintenanceDateDesc(deviceId).stream()
                .map(this::toDto)
                .toList();
    }

    private MaintenanceRecordResponseDto toDto(MaintenanceRecord r) {
        return new MaintenanceRecordResponseDto(
                r.getId(), r.getDevice().getId(), r.getMaintenanceDate(), r.getNextMaintenanceDate(),
                r.getDescription(), r.getPerformedBy(), r.getCreatedAt()
        );
    }
}
