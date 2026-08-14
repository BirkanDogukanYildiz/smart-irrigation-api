package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.AuditLogResponseDto;
import com.belediye.bitkisulama.dto.PageResponseDto;
import com.belediye.bitkisulama.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping("/list")
    public List<AuditLogResponseDto> getLogs() {
        return auditLogService.getLogs();
    }

    // Server-side sayfalama/filtreleme/arama.
    @GetMapping("/search")
    public PageResponseDto<AuditLogResponseDto> searchLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        return auditLogService.searchLogs(page, size, action, username, resourceType, q, dateFrom, dateTo);
    }
}