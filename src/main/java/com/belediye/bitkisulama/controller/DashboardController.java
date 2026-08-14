package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.DashboardResponseDto;
import com.belediye.bitkisulama.dto.RegionDeviceBreakdownDto;
import com.belediye.bitkisulama.entity.Region;
import com.belediye.bitkisulama.entity.SprinklerInfo;
import com.belediye.bitkisulama.enums.Status;
import com.belediye.bitkisulama.repository.RegionRepository;
import com.belediye.bitkisulama.repository.SprinklerInfoRepository;
import com.belediye.bitkisulama.repository.UserRepository;
import com.belediye.bitkisulama.service.RegionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final RegionRepository regionRepository;
    private final SprinklerInfoRepository sprinklerInfoRepository;
    private final UserRepository userRepository;
    private final RegionService regionService;

    @GetMapping("/summary")
    public DashboardResponseDto getSummary() {
        DashboardResponseDto dto = new DashboardResponseDto();

        // ---- Mevcut alanlar: DOKUNULMADI, aynı davranış korunuyor ----
        dto.setTotalRegions(regionRepository.count());
        dto.setTotalDevices(sprinklerInfoRepository.count());
        dto.setWorkingDevices(sprinklerInfoRepository.countByStatus(Status.WORKING));
        dto.setFaultyDevices(sprinklerInfoRepository.countByStatus(Status.FAULTY));
        dto.setTotalUsers(userRepository.count());

        // ---- YENİ: bölge/tür/arıza kırılımları ----
        // Görünürlük kuralına (RegionService.getVisibleRegionEntities) BİLİNÇLİ OLARAK
        // uyuluyor: ADMIN hepsini, HEADGARDENER/GARDENER sadece kendi kapsamındaki
        // bölgeleri görür. Aksi halde bu yeni kırılımlar, sistemin geri kalanında zaten
        // uygulanan bölge gizliliğini delerdi (yukarıdaki mevcut toplam sayılar bu
        // filtreyi uygulamıyor, ama onlara dokunmuyoruz — sadece yeni eklenen alanlar
        // görünürlük kuralına uyuyor).
        List<Region> visibleRegions = regionService.getVisibleRegionEntities();
        List<Long> visibleRegionIds = visibleRegions.stream().map(Region::getId).toList();

        List<SprinklerInfo> visibleDevices = visibleRegionIds.isEmpty()
                ? List.of()
                : sprinklerInfoRepository.findByRegionIdIn(visibleRegionIds);

        Map<Long, List<SprinklerInfo>> devicesByRegion = visibleDevices.stream()
                .collect(Collectors.groupingBy(d -> d.getRegion().getId()));

        List<RegionDeviceBreakdownDto> regionBreakdown = visibleRegions.stream()
                .map(r -> {
                    List<SprinklerInfo> devices = devicesByRegion.getOrDefault(r.getId(), List.of());
                    long working = devices.stream().filter(d -> d.getStatus() == Status.WORKING).count();
                    long faulty = devices.stream().filter(d -> d.getStatus() == Status.FAULTY).count();
                    return new RegionDeviceBreakdownDto(
                            r.getId(), r.getRegionName(), r.getDistrictName(),
                            (long) devices.size(), working, faulty
                    );
                })
                .sorted(Comparator.comparing(RegionDeviceBreakdownDto::getRegionName))
                .toList();
        dto.setRegionBreakdown(regionBreakdown);

        Map<String, Long> assetTypeBreakdown = visibleDevices.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getAssetType().name(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        dto.setAssetTypeBreakdown(assetTypeBreakdown);

        Map<String, Long> faultTypeBreakdown = visibleDevices.stream()
                .filter(d -> d.getStatus() == Status.FAULTY)
                .collect(Collectors.groupingBy(
                        d -> (d.getFaultType() == null || d.getFaultType().isBlank()) ? "Belirtilmemiş" : d.getFaultType(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        dto.setFaultTypeBreakdown(faultTypeBreakdown);

        return dto;
    }
}
