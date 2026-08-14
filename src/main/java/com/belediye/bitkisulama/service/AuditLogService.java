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

    // Eski, basit imza — mevcut çağıranları bozmamak için AYNEN korunuyor.
    // Sadece işlem türü + açıklama gerektiren durumlar için hâlâ kullanılabilir.
    @Transactional
    public void logAction(String action, String details) {
        logAction(action, null, null, details, null, null);
    }

    // Yeni, ayrıntılı imza: kaynak türü/ID'si ve eski/yeni değer de kaydedilir.
    // Kullanıcı adı ve rolü otomatik olarak o an giriş yapmış kullanıcıdan alınır.
    @Transactional
    public void logAction(String action, String resourceType, Long resourceId, String details, String oldValue, String newValue) {
        String username = "SİSTEM";
        String userRole = null;

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            username = authentication.getName();
            User current = userRepository.findByUsername(username).orElse(null);
            if (current != null && current.getRole() != null) {
                userRole = current.getRole().name();
            }
        }

        AuditLog auditLog = new AuditLog();
        auditLog.setUsername(username);
        auditLog.setUserRole(userRole);
        auditLog.setAction(action);
        auditLog.setResourceType(resourceType);
        auditLog.setResourceId(resourceId);
        auditLog.setDetails(details);
        auditLog.setOldValue(oldValue);
        auditLog.setNewValue(newValue);
        auditLogRepository.save(auditLog);
    }

    // Kullanıcı adı bilinen ama henüz SecurityContext'e yazılmamış olabileceği tek durum:
    // login sırasında token üretilmeden hemen önce. Bu yüzden login logu için ayrı,
    // username'i doğrudan parametre olarak alan bir metod kullanılıyor.
    @Transactional
    public void logLogin(String username, String role) {
        AuditLog auditLog = new AuditLog();
        auditLog.setUsername(username);
        auditLog.setUserRole(role);
        auditLog.setAction(AuditActions.GIRIS_YAPILDI);
        auditLog.setResourceType(AuditActions.KAYNAK_AUTH);
        auditLog.setDetails("'" + username + "' sisteme giriş yaptı.");
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
            dto.setUserRole(l.getUserRole());
            dto.setResourceType(l.getResourceType());
            dto.setResourceId(l.getResourceId());
            dto.setOldValue(l.getOldValue());
            dto.setNewValue(l.getNewValue());
            return dto;
        }).toList();
    }

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return null;
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }

    // Server-side sayfalama/filtreleme/arama. Temel veri seti getLogs()'tan gelir —
    // yani rol bazlı görünürlük (ADMIN hepsi, HEADGARDENER sadece kendi ekibi) burada da
    // aynen korunur, filtreleme/arama sadece o kümenin ÜZERİNE uygulanır.
    @Transactional(readOnly = true)
    public com.belediye.bitkisulama.dto.PageResponseDto<AuditLogResponseDto> searchLogs(
            int page, int size, String action, String username, String resourceType,
            String query, java.time.LocalDate dateFrom, java.time.LocalDate dateTo
    ) {
        List<AuditLogResponseDto> base = getLogs();

        java.util.stream.Stream<AuditLogResponseDto> stream = base.stream();
        if (action != null && !action.isBlank()) stream = stream.filter(l -> action.equals(l.getAction()));
        if (username != null && !username.isBlank()) stream = stream.filter(l -> username.equals(l.getUsername()));
        if (resourceType != null && !resourceType.isBlank()) stream = stream.filter(l -> resourceType.equals(l.getResourceType()));
        if (dateFrom != null) {
            stream = stream.filter(l -> l.getTimestamp() != null && !l.getTimestamp().toLocalDate().isBefore(dateFrom));
        }
        if (dateTo != null) {
            stream = stream.filter(l -> l.getTimestamp() != null && !l.getTimestamp().toLocalDate().isAfter(dateTo));
        }
        if (query != null && !query.isBlank()) {
            String q = query.toLowerCase();
            stream = stream.filter(l -> l.getDetails() != null && l.getDetails().toLowerCase().contains(q));
        }

        List<AuditLogResponseDto> filtered = stream.toList(); // getLogs() zaten tarihe göre azalan sıralı geliyor

        return PageUtil.paginate(filtered, page, size);
    }
}
