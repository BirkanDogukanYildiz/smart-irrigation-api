package com.belediye.parksystems.controller;

import com.belediye.parksystems.dto.CitizenRequestCreateDto;
import com.belediye.parksystems.dto.CitizenRequestResponseDto;
import com.belediye.parksystems.dto.PublicParkDto;
import com.belediye.parksystems.dto.PublicRegionOptionDto;
import com.belediye.parksystems.dto.PublicRegionSummaryDto;
import com.belediye.parksystems.dto.PublicSummaryDto;
import com.belediye.parksystems.enums.AssetType;
import com.belediye.parksystems.enums.Status;
import com.belediye.parksystems.repository.RegionRepository;
import com.belediye.parksystems.repository.SprinklerInfoRepository;
import com.belediye.parksystems.service.CitizenRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Faz 6-A: Vatandaşa açık, kimlik doğrulama GEREKTİRMEYEN şeffaflık uç noktası.
 * SecurityConfig'te "/api/public/**" GET permitAll, POST /api/public/requests
 * ayrıca permitAll olarak işaretlenmiştir.
 *
 * DİKKAT: DashboardController'ın aksine burada SADECE hassas olmayan, toplu/
 * istatistiksel veri döndürülür. Kullanıcı sayısı, cihaz numarası, konum,
 * kullanıcı adı, baş bahçivan bilgisi gibi iç bilgiler kasıtlı olarak DIŞARIDA
 * bırakılmıştır (bkz. PublicRegionSummaryDto).
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final RegionRepository regionRepository;
    private final SprinklerInfoRepository sprinklerInfoRepository;
    private final CitizenRequestService citizenRequestService;

    @GetMapping("/ozet")
    public PublicSummaryDto getPublicSummary() {
        PublicSummaryDto dto = new PublicSummaryDto();

        long total = sprinklerInfoRepository.count();
        long working = sprinklerInfoRepository.countByStatus(Status.WORKING);
        long faulty = sprinklerInfoRepository.countByStatus(Status.FAULTY);

        dto.setTotalAssets(total);
        dto.setTotalRegions(regionRepository.count());
        dto.setWorkingCount(working);
        dto.setFaultyCount(faulty);
        dto.setWorkingRatioPercent(total == 0 ? 0.0 : Math.round((working * 1000.0) / total) / 10.0);

        Map<String, Long> breakdown = new LinkedHashMap<>();
        for (AssetType type : AssetType.values()) {
            long count = sprinklerInfoRepository.countByAssetType(type);
            if (count > 0) {
                breakdown.put(type.name(), count);
            }
        }
        dto.setAssetTypeBreakdown(breakdown);

        // 3.2 madde 5: bölge bazlı basit liste. Görünürlük filtresi burada BİLİNÇLİ
        // OLARAK uygulanmıyor (RegionService.getVisibleRegionEntities kullanılmıyor):
        // bu endpoint zaten herkese açık, rol bazlı gizlilik burada anlamsız —
        // tüm bölgeler isim + toplam ekipman sayısıyla listeleniyor.
        List<PublicRegionSummaryDto> regions = regionRepository.findAll().stream()
                .map(r -> new PublicRegionSummaryDto(
                        r.getRegionName(),
                        r.getDistrictName(),
                        sprinklerInfoRepository.countByRegionId(r.getId())
                ))
                .toList();
        dto.setRegions(regions);

        return dto;
    }

    // Talep formundaki "Hangi park/bölge ile ilgili?" dropdown'u için — sadece
    // id + isim, hassas hiçbir alan yok (bkz. PublicRegionOptionDto).
    @GetMapping("/regions")
    public List<PublicRegionOptionDto> getPublicRegionOptions() {
        return citizenRequestService.listPublicRegionOptions();
    }

    // Vatandaş haritası (Parklar sayfası) için: personel tarafında zone'u (boundary)
    // ÇİZİLMİŞ bölgeleri döndürür. Aynı Region entity'sini, aynı boundary formatını
    // kullanır — ayrı bir "park" veri modeli YOK. Zone'u henüz çizilmemiş bölgeler
    // burada listelenmez (centroid hesaplanacak bir polygon yok, gösterilecek anlamlı
    // bir konum bulunmuyor); onlar personel tarafında zone çizilince otomatik görünür.
    @GetMapping("/parks")
    public List<PublicParkDto> getPublicParks() {
        return regionRepository.findAll().stream()
                .filter(r -> r.getBoundary() != null && !r.getBoundary().isBlank())
                .map(r -> new PublicParkDto(
                        r.getId(),
                        r.getRegionName(),
                        r.getDistrictName(),
                        r.getDescription(),
                        r.getBoundary(),
                        sprinklerInfoRepository.countByRegionId(r.getId())
                ))
                .toList();
    }

    // Vatandaş talep/şikayet oluşturma — kimlik doğrulama GEREKTİRMEZ.
    // SecurityConfig'te ayrıca (GET /api/public/** kuralından bağımsız olarak)
    // POST /api/public/requests permitAll işaretlenmiştir.
    @PostMapping("/requests")
    public CitizenRequestResponseDto createCitizenRequest(@Valid @RequestBody CitizenRequestCreateDto dto) {
        return citizenRequestService.createRequest(dto);
    }
}
