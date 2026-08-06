package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.AuditLogResponseDto;
import com.belediye.bitkisulama.entity.AuditLog;
import com.belediye.bitkisulama.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(String action, String details) {
        String username = "SİSTEM";

        // Giriş yapmış mevcut kullanıcıyı Spring Security'den otomatik yakala
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
        }

        AuditLog log = new AuditLog();
        log.setUsername(username);
        log.setAction(action);
        log.setDetails(details);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponseDto> getLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc().stream().map(log -> {
            AuditLogResponseDto dto = new AuditLogResponseDto();
            dto.setId(log.getId());
            dto.setUsername(log.getUsername());
            dto.setAction(log.getAction());
            dto.setDetails(log.getDetails());
            dto.setTimestamp(log.getTimestamp());
            return dto;
        }).toList();
    }
}