package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.*;
import com.belediye.bitkisulama.entity.Region;
import com.belediye.bitkisulama.entity.SprinklerInfo;
import com.belediye.bitkisulama.enums.Status;
import com.belediye.bitkisulama.export.CsvBuilder;
import com.belediye.bitkisulama.repository.RegionRepository;
import com.belediye.bitkisulama.repository.SprinklerInfoRepository;
import com.belediye.bitkisulama.repository.UserRepository;
import com.belediye.bitkisulama.service.AuditLogService;
import com.belediye.bitkisulama.service.RegionService;
import com.belediye.bitkisulama.service.SprinklerInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Raporlama/export uç noktaları. Hiçbir yeni harici kütüphane EKLENMEDİ — CSV
 * üretimi tamamen java.lang ile yapılıyor (bkz. CsvBuilder). CSV, Excel'de
 * doğrudan açılabildiği için "Excel export" ihtiyacını gerçek indirilebilir bir
 * dosyayla karşılıyor. "PDF export" ihtiyacı ise frontend'de yazdırmaya uygun
 * (print-friendly) bir rapor görünümü + tarayıcının "PDF olarak kaydet" özelliği
 * ile karşılanıyor — backend'e ayrı bir PDF kütüphanesi (iText/OpenPDF gibi)
 * eklemek, bu ortamda derlemesini doğrulayamayacağım yeni bir bağımlılık riski
 * taşıyordu, bu yüzden bilinçli olarak tercih edilmedi.
 *
 * Her export, o kaynağın normal listeleme uç noktasıyla AYNI görünürlük kuralına
 * tabidir (ADMIN hepsini, HEADGARDENER/GARDENER sadece kendi kapsamını görür).
 */
@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private static final DateTimeFormatter DT = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    private final RegionService regionService;
    private final SprinklerInfoService sprinklerInfoService;
    private final AuditLogService auditLogService;
    private final RegionRepository regionRepository;
    private final SprinklerInfoRepository sprinklerInfoRepository;
    private final UserRepository userRepository;

    @GetMapping("/regions.csv")
    public ResponseEntity<byte[]> exportRegions() {
        List<String> headers = List.of(
                "Bölge No", "Bölge Adı", "İlçe", "Park Alanı", "Baş Bahçivan", "Açıklama"
        );
        List<List<String>> rows = new ArrayList<>();
        for (RegionResponseDto r : regionService.listRegions()) {
            rows.add(List.of(
                    str(r.getRegionNo()), nz(r.getRegionName()), nz(r.getDistrictName()),
                    nz(r.getIrrigationAreaName()), nz(r.getHeadGardenerUsername()), nz(r.getDescription())
            ));
        }
        return csvResponse("bolgeler.csv", CsvBuilder.build(headers, rows));
    }

    @GetMapping("/devices.csv")
    public ResponseEntity<byte[]> exportDevices() {
        return csvResponse("ekipmanlar.csv", buildDeviceCsv(sprinklerInfoService.sprinklerDeviceGeneral(), false));
    }

    // Aynı veri, sadece FAULTY olanlar — "Arıza" raporu.
    @GetMapping("/faults.csv")
    public ResponseEntity<byte[]> exportFaults() {
        List<SprinklerInfoResponseDto> faulty = sprinklerInfoService.sprinklerDeviceGeneral().stream()
                .filter(d -> d.getStatus() == Status.FAULTY)
                .toList();
        return csvResponse("arizalar.csv", buildDeviceCsv(faulty, true));
    }

    @GetMapping("/logs.csv")
    public ResponseEntity<byte[]> exportLogs() {
        List<String> headers = List.of(
                "Tarih", "Kullanıcı", "Rol", "İşlem", "Kaynak Türü", "Kaynak ID", "Açıklama", "Eski Değer", "Yeni Değer"
        );
        List<List<String>> rows = new ArrayList<>();
        for (AuditLogResponseDto l : auditLogService.getLogs()) {
            rows.add(List.of(
                    l.getTimestamp() != null ? l.getTimestamp().format(DT) : "",
                    nz(l.getUsername()), nz(l.getUserRole()), nz(l.getAction()),
                    nz(l.getResourceType()), str(l.getResourceId()), nz(l.getDetails()),
                    nz(l.getOldValue()), nz(l.getNewValue())
            ));
        }
        return csvResponse("islem_gecmisi.csv", CsvBuilder.build(headers, rows));
    }

    @GetMapping("/dashboard.csv")
    public ResponseEntity<byte[]> exportDashboard() {
        List<String> headers = List.of("Metrik", "Değer");
        List<List<String>> rows = new ArrayList<>();

        long totalRegions = regionRepository.count();
        long totalDevices = sprinklerInfoRepository.count();
        long working = sprinklerInfoRepository.countByStatus(Status.WORKING);
        long faulty = sprinklerInfoRepository.countByStatus(Status.FAULTY);
        long totalUsers = userRepository.count();

        rows.add(List.of("Toplam Bölge", str(totalRegions)));
        rows.add(List.of("Toplam Ekipman", str(totalDevices)));
        rows.add(List.of("Çalışan Ekipman", str(working)));
        rows.add(List.of("Arızalı Ekipman", str(faulty)));
        rows.add(List.of("Toplam Kullanıcı", str(totalUsers)));
        rows.add(List.of("Rapor Tarihi", LocalDateTime.now().format(DT)));

        // Bölge kırılımı (görünürlük kuralına uyar — DashboardController'daki mantıkla aynı)
        List<Region> visibleRegions = regionService.getVisibleRegionEntities();
        List<Long> visibleIds = visibleRegions.stream().map(Region::getId).toList();
        List<SprinklerInfo> visibleDevices = visibleIds.isEmpty()
                ? List.of()
                : sprinklerInfoRepository.findByRegionIdIn(visibleIds);
        Map<Long, List<SprinklerInfo>> byRegion = new LinkedHashMap<>();
        for (SprinklerInfo d : visibleDevices) {
            byRegion.computeIfAbsent(d.getRegion().getId(), k -> new ArrayList<>()).add(d);
        }
        rows.add(List.of("", ""));
        rows.add(List.of("Bölge", "Toplam / Çalışan / Arızalı"));
        for (Region r : visibleRegions) {
            List<SprinklerInfo> devices = byRegion.getOrDefault(r.getId(), List.of());
            long w = devices.stream().filter(d -> d.getStatus() == Status.WORKING).count();
            long f = devices.stream().filter(d -> d.getStatus() == Status.FAULTY).count();
            rows.add(List.of(r.getRegionName(), devices.size() + " / " + w + " / " + f));
        }

        return csvResponse("dashboard_ozet.csv", CsvBuilder.build(headers, rows));
    }

    private String buildDeviceCsv(List<SprinklerInfoResponseDto> devices, boolean faultColumns) {
        List<String> headers = faultColumns
                ? List.of("Cihaz ID", "No", "Tür", "Bölge", "İlçe", "Arıza Türü", "Açıklama", "Açılma Tarihi", "İlgili Personel")
                : List.of("Cihaz ID", "No", "Tür", "Bölge", "İlçe", "Durum", "Oluşturulma Tarihi", "Son Güncelleme");

        List<List<String>> rows = new ArrayList<>();
        for (SprinklerInfoResponseDto d : devices) {
            if (faultColumns) {
                rows.add(List.of(
                        str(d.getId()), str(d.getDeviceNo()), nz(String.valueOf(d.getAssetType())),
                        d.getRegion() != null ? nz(d.getRegion().getRegionName()) : "",
                        d.getRegion() != null ? nz(d.getRegion().getDistrictName()) : "",
                        nz(d.getFaultType()), nz(d.getDescription()),
                        d.getStatusChangedAt() != null ? d.getStatusChangedAt().format(DT) : "",
                        nz(d.getLastUpdatedBy())
                ));
            } else {
                rows.add(List.of(
                        str(d.getId()), str(d.getDeviceNo()), nz(String.valueOf(d.getAssetType())),
                        d.getRegion() != null ? nz(d.getRegion().getRegionName()) : "",
                        d.getRegion() != null ? nz(d.getRegion().getDistrictName()) : "",
                        nz(String.valueOf(d.getStatus())),
                        d.getCreatedAt() != null ? d.getCreatedAt().format(DT) : "",
                        d.getStatusChangedAt() != null ? d.getStatusChangedAt().format(DT) : ""
                ));
            }
        }
        return CsvBuilder.build(headers, rows);
    }

    private ResponseEntity<byte[]> csvResponse(String filename, String csvContent) {
        byte[] bytes = csvContent.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename, StandardCharsets.UTF_8).build());
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }

    private static String str(Object o) {
        return o == null ? "" : String.valueOf(o);
    }
}
