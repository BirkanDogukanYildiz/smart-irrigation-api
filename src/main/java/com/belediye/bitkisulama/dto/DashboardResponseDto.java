package com.belediye.bitkisulama.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class DashboardResponseDto {
    // ---- Mevcut alanlar: DOKUNULMADI, davranışları aynen korundu ----
    private long totalRegions;
    private long totalDevices;
    private long workingDevices;
    private long faultyDevices;
    private long totalUsers;

    // ---- YENİ: anlamlı kırılımlar (görünürlük kuralına uyar, gerçek veriden hesaplanır) ----

    // Bölge bazlı: her bölgenin toplam/çalışan/arızalı ekipman sayısı
    private List<RegionDeviceBreakdownDto> regionBreakdown;

    // Ekipman türü bazlı toplam (SULAMA_CIHAZI, AYDINLATMA, BANK, ...)
    private Map<String, Long> assetTypeBreakdown;

    // Arıza türü bazlı toplam (sadece FAULTY cihazlar; faultType boşsa "Belirtilmemiş")
    private Map<String, Long> faultTypeBreakdown;
}