package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.NotificationResponseDto;
import com.belediye.bitkisulama.entity.Notification;
import com.belediye.bitkisulama.entity.SprinklerInfo;
import com.belediye.bitkisulama.entity.User;
import com.belediye.bitkisulama.enums.Role;
import com.belediye.bitkisulama.repository.NotificationRepository;
import com.belediye.bitkisulama.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return null;
        return userRepository.findByUsername(authentication.getName()).orElse(null);
    }

    // Arıza oluştuğunda (WORKING -> FAULTY) çağrılır (bkz. SprinklerInfoService.updateStatus).
    // "İlgili yetkili kullanıcılar": tüm ADMIN'ler + o bölgeden sorumlu baş bahçivan
    // (varsa). Bu, sistemde zaten var olan sahiplik/yetki modelini (Region.headGardener)
    // birebir kullanıyor — yeni bir yetki/rol kavramı EKLENMEDİ.
    @Transactional
    public void notifyFaultCreated(SprinklerInfo device, String reportedBy) {
        Set<User> recipients = new LinkedHashSet<>(userRepository.findByRole(Role.ADMIN));

        User headGardener = device.getRegion().getHeadGardener();
        if (headGardener != null) {
            recipients.add(headGardener);
        }

        if (recipients.isEmpty()) {
            return;
        }

        String title = "Yeni Arıza Bildirimi";
        String message = String.format(
                "%s #%d (%s) arızalı olarak işaretlendi. Bildiren: %s",
                device.getAssetType(), device.getDeviceNo(), device.getRegion().getRegionName(),
                reportedBy != null ? reportedBy : "bilinmiyor"
        );

        for (User recipient : recipients) {
            Notification n = new Notification();
            n.setUser(recipient);
            n.setTitle(title);
            n.setMessage(message);
            n.setResourceType(AuditActions.KAYNAK_CIHAZ);
            n.setResourceId(device.getId());
            notificationRepository.save(n);
        }
        log.info("Arıza bildirimi {} kullanıcıya gönderildi: deviceId={}", recipients.size(), device.getId());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getMyNotifications() {
        User current = getCurrentUser();
        if (current == null) return List.of();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(current.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User current = getCurrentUser();
        if (current == null) return 0;
        return notificationRepository.countByUserIdAndReadFalse(current.getId());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        User current = getCurrentUser();
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Bildirim bulunamadı: id=" + notificationId));

        // Başka bir kullanıcının bildirimini okundu işaretlemeye çalışmak, o bildirimin
        // var olup olmadığını bile ifşa etmeden reddedilir.
        if (current == null || !n.getUser().getId().equals(current.getId())) {
            throw new IllegalArgumentException("Bildirim bulunamadı: id=" + notificationId);
        }

        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsRead() {
        User current = getCurrentUser();
        if (current == null) return;
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(current.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponseDto toDto(Notification n) {
        return new NotificationResponseDto(
                n.getId(), n.getTitle(), n.getMessage(),
                n.getResourceType(), n.getResourceId(),
                n.isRead(), n.getCreatedAt()
        );
    }
}
