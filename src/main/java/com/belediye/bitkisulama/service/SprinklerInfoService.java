package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.RegionResponseDto;
import com.belediye.bitkisulama.dto.SprinklerInfoRequestDto;
import com.belediye.bitkisulama.dto.SprinklerInfoResponseDto;
import com.belediye.bitkisulama.entity.Region;
import com.belediye.bitkisulama.enums.AssetType;
import com.belediye.bitkisulama.enums.Status;
import com.belediye.bitkisulama.entity.SprinklerInfo;
import com.belediye.bitkisulama.exception.DeviceNotFoundException;
import com.belediye.bitkisulama.repository.SprinklerInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SprinklerInfoService {

    private final SprinklerInfoRepository sprinklerInfoRepository;
    private final RegionService regionService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    // ---- YARDIMCI (private) METODLAR ----

    private SprinklerInfo toEntity(SprinklerInfoRequestDto dto) {
        Region region = regionService.getRegionEntity(dto.getRegionId());

        SprinklerInfo entity = new SprinklerInfo();
        entity.setRegion(region);
        entity.setDeviceNo(dto.getDeviceNo());
        entity.setStatus(Status.WORKING); // yeni cihaz her zaman "çalışıyor" olarak başlar

        // Tür gönderilmediyse (eski frontend çağrıları / null) varsayılan SULAMA_CIHAZI.
        entity.setAssetType(dto.getAssetType() != null ? dto.getAssetType() : AssetType.SULAMA_CIHAZI);

        // ---- HARİTA İÇİN EKLENEN KOORDİNATLAR ----
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());

        // createdAt / statusChangedAt entity'nin @PrePersist'inde otomatik set edilir.

        return entity;
    }

    private SprinklerInfoResponseDto toDto(SprinklerInfo entity) {
        Region region = entity.getRegion();
        var headGardener = region.getHeadGardener();
        RegionResponseDto regionDto = new RegionResponseDto(
                region.getId(), region.getDistrictNo(), region.getDistrictName(),
                region.getRegionNo(), region.getRegionName(),
                region.getIrrigationAreaNo(), region.getIrrigationAreaName(),
                region.getDescription(),
                headGardener != null ? headGardener.getId() : null,
                headGardener != null ? headGardener.getUsername() : null,
                region.getBoundary()
        );

        SprinklerInfoResponseDto dto = new SprinklerInfoResponseDto();
        dto.setId(entity.getId());
        dto.setRegion(regionDto);
        dto.setDeviceNo(entity.getDeviceNo());
        dto.setStatus(entity.getStatus());
        dto.setAssetType(entity.getAssetType());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setDescription(entity.getDescription());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setStatusChangedAt(entity.getStatusChangedAt());
        dto.setFaultType(entity.getFaultType());
        dto.setLastUpdatedBy(entity.getLastUpdatedBy());
        return dto;
    }

    private String getCurrentUsername() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    private String deviceLabel(SprinklerInfo d) {
        return d.getAssetType() + " #" + d.getDeviceNo() + " (bölge: " + d.getRegion().getRegionName() + ")";
    }

    // ---- ASIL METODLAR ----

    @Transactional
    public SprinklerInfoResponseDto deviceSave(SprinklerInfoRequestDto dto) {
        SprinklerInfo saved = sprinklerInfoRepository.save(toEntity(dto));
        log.info("Yeni cihaz kaydedildi: id={}, regionId={}", saved.getId(), dto.getRegionId());

        auditLogService.logAction(
                AuditActions.CIHAZ_OLUSTURULDU,
                AuditActions.KAYNAK_CIHAZ,
                saved.getId(),
                deviceLabel(saved) + " sisteme eklendi.",
                null,
                deviceLabel(saved)
        );
        return toDto(saved);
    }

    @Transactional
    public List<SprinklerInfoResponseDto> deviceSaveAll(List<SprinklerInfoRequestDto> newSaveAll) {
        List<SprinklerInfo> entities = newSaveAll.stream()
                .map(this::toEntity)
                .toList();

        List<SprinklerInfo> saved = sprinklerInfoRepository.saveAll(entities);

        saved.forEach(d -> auditLogService.logAction(
                AuditActions.CIHAZ_OLUSTURULDU,
                AuditActions.KAYNAK_CIHAZ,
                d.getId(),
                deviceLabel(d) + " toplu ekleme ile sisteme eklendi.",
                null,
                deviceLabel(d)
        ));

        return saved.stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SprinklerInfoResponseDto> sprinklerDeviceGeneral() {
        // Cihazlar da bağlı oldukları bölge üzerinden aynı görünürlük kuralına tabi:
        // ADMIN hepsini görür, HEADGARDENER sadece kendi bölgelerindekileri,
        // GARDENER ise bağlı olduğu baş bahçivanın bölgelerindekileri görür.
        java.util.Set<Long> gorunurBolgeIdleri = regionService.getVisibleRegionEntities().stream()
                .map(Region::getId)
                .collect(java.util.stream.Collectors.toSet());

        return sprinklerInfoRepository.findAll().stream()
                .filter(d -> gorunurBolgeIdleri.contains(d.getRegion().getId()))
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void deviceDelete(Long id) {
        SprinklerInfo device = sprinklerInfoRepository.findById(id).orElse(null);
        if (device == null) {
            log.warn("Silinmek istenen cihaz bulunamadı: id={}", id);
            throw new DeviceNotFoundException(id);
        }

        String label = deviceLabel(device);
        sprinklerInfoRepository.deleteById(id);
        log.info("Cihaz silindi: id={}", id);

        auditLogService.logAction(
                AuditActions.CIHAZ_SILINDI,
                AuditActions.KAYNAK_CIHAZ,
                id,
                label + " sistemden silindi.",
                label,
                null
        );
    }

    @Transactional
    public SprinklerInfoResponseDto deviceUpdate(Long id, SprinklerInfoRequestDto updatedInfo) {
        SprinklerInfo devicePresent = sprinklerInfoRepository.findById(id)
                .orElseThrow(() -> new DeviceNotFoundException(id));

        String oldLabel = deviceLabel(devicePresent);

        Region region = regionService.getRegionEntity(updatedInfo.getRegionId());
        devicePresent.setRegion(region);
        devicePresent.setDeviceNo(updatedInfo.getDeviceNo());

        // Tür gönderilmediyse mevcut türü koru (kısmi güncellemeyi bozma).
        if (updatedInfo.getAssetType() != null) {
            devicePresent.setAssetType(updatedInfo.getAssetType());
        }

        SprinklerInfo saved = sprinklerInfoRepository.save(devicePresent);
        log.info("Cihaz güncellendi: id={}", saved.getId());

        auditLogService.logAction(
                AuditActions.CIHAZ_GUNCELLENDI,
                AuditActions.KAYNAK_CIHAZ,
                saved.getId(),
                "Cihaz bilgileri güncellendi.",
                oldLabel,
                deviceLabel(saved)
        );
        return toDto(saved);
    }

    @Transactional
    public SprinklerInfoResponseDto updateStatus(Long id, Status newStatus, String description, String faultType) {
        SprinklerInfo device = sprinklerInfoRepository.findById(id)
                .orElseThrow(() -> new DeviceNotFoundException(id));
        if (newStatus == Status.FAULTY && (description == null || description.isBlank())) {
            throw new IllegalArgumentException("Cihazı arızalı olarak işaretlerken açıklama girmek zorunludur!");
        }

        Status oldStatus = device.getStatus();
        String oldDescription = device.getDescription();

        device.setStatus(newStatus);
        device.setDescription(newStatus == Status.FAULTY ? description : null);
        device.setFaultType(newStatus == Status.FAULTY ? faultType : null);
        device.setStatusChangedAt(LocalDateTime.now());
        device.setLastUpdatedBy(getCurrentUsername());

        SprinklerInfo saved = sprinklerInfoRepository.save(device);
        log.info("Cihaz durumu güncellendi: id={}, newStatus={}", saved.getId(), newStatus);

        // Sistemde sadece iki gerçek durum var (WORKING/FAULTY), bu yüzden her geçiş
        // aslında bir "arıza" olayıdır. Buna göre üç ayrı, anlamlı işlem türü kullanıyoruz;
        // WORKING->WORKING gibi teorik (gerçekte olmaması gereken) bir çağrı için de
        // genel bir "Cihaz güncellendi" ile düşmüyoruz, çünkü bu durum sistemde gerçekleşmiyor.
        String action;
        String detay;
        if (oldStatus != Status.FAULTY && newStatus == Status.FAULTY) {
            action = AuditActions.ARIZA_OLUSTURULDU;
            detay = deviceLabel(device) + " için arıza bildirildi. Sebep: " + description;
            // Bildirim sistemi: ADMIN'ler + bölgenin baş bahçivanına bildirim oluşturulur.
            // Sadece GERÇEKTEN yeni bir arıza oluştuğunda (WORKING->FAULTY) tetiklenir —
            // arıza güncellemesi/kapatılması bildirim spam'ine yol açmasın diye burada tutuldu.
            notificationService.notifyFaultCreated(device, getCurrentUsername());
        } else if (oldStatus == Status.FAULTY && newStatus == Status.FAULTY) {
            action = AuditActions.ARIZA_GUNCELLENDI;
            detay = deviceLabel(device) + " için arıza bilgisi güncellendi.";
        } else { // FAULTY -> WORKING
            action = AuditActions.ARIZA_KAPATILDI;
            detay = deviceLabel(device) + " onarıldı, tekrar çalışır duruma alındı.";
        }

        auditLogService.logAction(
                action,
                AuditActions.KAYNAK_CIHAZ,
                saved.getId(),
                detay,
                oldStatus + (oldDescription != null ? " (" + oldDescription + ")" : ""),
                newStatus + (device.getDescription() != null ? " (" + device.getDescription() + ")" : "")
        );
        return toDto(saved);
    }

    // /cihazlar/:id detay sayfası (paylaşılabilir) buradan besleniyor. Görünürlük kontrolü
    // BİLİNÇLİ OLARAK eklendi: bu endpoint önceden frontend tarafından hiç çağrılmıyordu,
    // şimdi doğrudan URL üzerinden erişilebilir bir sayfaya bağlandığı için, sistemin geri
    // kalanında zaten uygulanan bölge görünürlüğü kuralına (aksi halde bir kullanıcı ID'sini
    // tahmin ederek kendi kapsamı dışındaki bir cihazın detayını görebilirdi) burada da uyuluyor.
    public SprinklerInfoResponseDto deviceInfo(Long id) {
        SprinklerInfo entity = sprinklerInfoRepository.findById(id)
                .orElseThrow(() -> new DeviceNotFoundException(id));

        java.util.Set<Long> gorunurBolgeIdleri = regionService.getVisibleRegionEntities().stream()
                .map(Region::getId)
                .collect(java.util.stream.Collectors.toSet());
        if (!gorunurBolgeIdleri.contains(entity.getRegion().getId())) {
            throw new DeviceNotFoundException(id);
        }

        return toDto(entity);
    }

    @Transactional
    public SprinklerInfoResponseDto updateLocation(Long id, Double latitude, Double longitude) {
        SprinklerInfo device = sprinklerInfoRepository.findById(id)
                .orElseThrow(() -> new DeviceNotFoundException(id));

        String oldValue = device.getLatitude() + ", " + device.getLongitude();

        device.setLatitude(latitude);
        device.setLongitude(longitude);

        SprinklerInfo saved = sprinklerInfoRepository.save(device);

        auditLogService.logAction(
                AuditActions.CIHAZ_KONUMU_GUNCELLENDI,
                AuditActions.KAYNAK_CIHAZ,
                saved.getId(),
                deviceLabel(saved) + " haritadaki konumu değiştirildi.",
                oldValue,
                latitude + ", " + longitude
        );

        return toDto(saved);
    }

    // ---- Server-side sayfalama/filtreleme/arama (Cihazlar + "Arızalar" görünümü) ----
    // "Arızalar" ayrı bir kaynak değil (sistemde ayrı bir Arıza entity'si yok, arıza =
    // status FAULTY olan cihaz) — bu yüzden ayrı bir endpoint AÇILMADI, aynı arama
    // uç noktası status=FAULTY parametresiyle çağrılarak kullanılıyor (kod tekrarını önler).
    @Transactional(readOnly = true)
    public com.belediye.bitkisulama.dto.PageResponseDto<SprinklerInfoResponseDto> searchDevices(
            int page, int size, Status status, AssetType assetType, Long regionId, String query,
            String sortBy, String sortDir
    ) {
        java.util.Set<Long> gorunurBolgeIdleri = regionService.getVisibleRegionEntities().stream()
                .map(Region::getId)
                .collect(java.util.stream.Collectors.toSet());
        List<SprinklerInfo> visible = gorunurBolgeIdleri.isEmpty()
                ? List.of()
                : sprinklerInfoRepository.findByRegionIdIn(gorunurBolgeIdleri);

        java.util.stream.Stream<SprinklerInfo> stream = visible.stream();
        if (status != null) stream = stream.filter(d -> d.getStatus() == status);
        if (assetType != null) stream = stream.filter(d -> d.getAssetType() == assetType);
        if (regionId != null) stream = stream.filter(d -> d.getRegion().getId().equals(regionId));
        if (query != null && !query.isBlank()) {
            String q = query.toLowerCase();
            stream = stream.filter(d ->
                    String.valueOf(d.getDeviceNo()).contains(q)
                            || d.getRegion().getRegionName().toLowerCase().contains(q)
                            || d.getRegion().getDistrictName().toLowerCase().contains(q)
                            || (d.getDescription() != null && d.getDescription().toLowerCase().contains(q))
                            || (d.getFaultType() != null && d.getFaultType().toLowerCase().contains(q))
            );
        }

        List<SprinklerInfo> filtered = new java.util.ArrayList<>(stream.toList());

        java.util.Comparator<SprinklerInfo> cmp = switch (sortBy == null ? "" : sortBy) {
            case "status" -> java.util.Comparator.comparing(d -> d.getStatus().name());
            case "region" -> java.util.Comparator.comparing(d -> d.getRegion().getRegionName());
            case "createdAt" -> java.util.Comparator.comparing(
                    SprinklerInfo::getCreatedAt, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()));
            default -> java.util.Comparator.comparing(SprinklerInfo::getDeviceNo);
        };
        if ("desc".equalsIgnoreCase(sortDir)) cmp = cmp.reversed();
        filtered.sort(cmp);

        List<SprinklerInfoResponseDto> dtos = filtered.stream().map(this::toDto).toList();
        return PageUtil.paginate(dtos, page, size);
    }
}
