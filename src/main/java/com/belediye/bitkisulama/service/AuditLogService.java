package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.AuditLogResponseDto;
import com.belediye.bitkisulama.entity.AuditLog;
import com.belediye.bitkisulama.entity.User;
import com.belediye.bitkisulama.enums.Role;
import com.belediye.bitkisulama.repository.AuditLogRepository;
import com.belediye.bitkisulama.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logAction(String action, String details) {
        String username = "SİSTEM";

        // Giriş yapmış mevcut kullanıcıyı Spring Security'den otomatik yakala
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
        }

        AuditLog auditLog = new AuditLog();
        auditLog.setUsername(username);
        auditLog.setAction(action);
        auditLog.setDetails(details);
        auditLogRepository.save(auditLog);
    }

    // Loglar rolüne göre filtrelenir:
    //  - ADMIN: sistemdeki tüm logları görür.
    //  - HEADGARDENER: kendisine bağlı bahçivanların ve kendi işlemlerinin loglarını görür
    //    (admin işlemleri ya da diğer baş bahçivanların ekibinin logları görünmez).
    // Bu uç noktaya zaten sadece ADMIN ve HEADGARDENER erişebiliyor (bkz. SecurityConfig).
    @Transactional(readOnly = true)
    public List<AuditLogResponseDto> getLogs() {
        User currentUser = getCurrentUser();
        List<AuditLog> logs;

        if (currentUser != null && currentUser.getRole() == Role.HEADGARDENER) {
            Set<String> kendiEkibi = userRepository.findByHeadGardenerId(currentUser.getId()).stream()
                    .map(User::getUsername)
                    .collect(Collectors.toCollection(HashSet::new));

            // Baş bahçıvan kendi yaptığı işlemleri de görebilmeli
            kendiEkibi.add(currentUser.getUsername());

            // Filtreleme veritabanı seviyesinde yapılır; tüm tabloyu belleğe
            // çekip Java'da filtrelemek (eski davranış) log sayısı büyüdükçe
            // ciddi performans ve bellek sorunu yaratır.
            logs = auditLogRepository.findByUsernameInOrderByTimestampDesc(kendiEkibi);
        } else {
            // ADMIN (bu uç noktaya rol bazında erişebilen tek diğer kullanıcı) tüm logları görür
            logs = auditLogRepository.findAllByOrderByTimestampDesc();
        }

        return logs.stream().map(l -> {
            AuditLogResponseDto dto = new AuditLogResponseDto();
            dto.setId(l.getId());
            dto.setUsername(l.getUsername());
            dto.setAction(l.getAction());
            dto.setDetails(l.getDetails());
            dto.setTimestamp(l.getTimestamp());
            return dto;
        }).toList();
    }

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return null;
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }
}
