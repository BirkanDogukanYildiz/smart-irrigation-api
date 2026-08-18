package com.belediye.parksystems.controller;

import com.belediye.parksystems.dto.CitizenRequestResponseDto;
import com.belediye.parksystems.enums.RequestStatus;
import com.belediye.parksystems.enums.RequestTopic;
import com.belediye.parksystems.service.CitizenRequestService;
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

    @PutMapping("/{id}/incelendi")
    public CitizenRequestResponseDto markReviewed(@PathVariable Long id) {
        return citizenRequestService.markReviewed(id);
    }
}
