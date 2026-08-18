package com.belediye.parksystems.controller;

import com.belediye.parksystems.dto.CitizenRequestResponseDto;
import com.belediye.parksystems.dto.CitizenRequestStatusUpdateDto;
import com.belediye.parksystems.enums.RequestStatus;
import com.belediye.parksystems.enums.RequestTopic;
import com.belediye.parksystems.service.CitizenRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// "Talepler" sayfası: vatandaşların oluşturduğu talepleri kronolojik bir log gibi
// listeler, konuya/duruma göre filtrelenebilir. Sadece ADMIN + HEADGARDENER erişebilir
// (bkz. SecurityConfig) — İşlem Geçmişi (loglar) ile aynı yetki seviyesi.
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final CitizenRequestService citizenRequestService;

    @GetMapping
    public List<CitizenRequestResponseDto> listRequests(
            @RequestParam(required = false) RequestTopic topic,
            @RequestParam(required = false) RequestStatus status
    ) {
        return citizenRequestService.listRequests(topic, status);
    }

    // Durum güncelleme: YENI/INCELENIYOR/INCELENDI arasında İKİ YÖNLÜ geçiş, opsiyonel
    // not ile. Eski tek yönlü "/incelendi" endpoint'i bilinçli olarak KALDIRILDI —
    // bu, API sözleşmesi (kalıcı veri değil), geriye dönük uyumluluk kısıtı ona
    // uygulanmıyor; frontend zaten aynı anda güncellendi (bkz. api/requests.js).
    @PutMapping("/{id}/status")
    public CitizenRequestResponseDto updateStatus(@PathVariable Long id, @Valid @RequestBody CitizenRequestStatusUpdateDto dto) {
        return citizenRequestService.updateStatus(id, dto.getStatus(), dto.getNote());
    }
}
