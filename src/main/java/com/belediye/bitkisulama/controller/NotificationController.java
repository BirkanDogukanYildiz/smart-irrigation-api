package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.NotificationResponseDto;
import com.belediye.bitkisulama.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Bu controller özel bir rol kısıtına ihtiyaç duymuyor (SecurityConfig'teki genel
// ".anyRequest().authenticated()" kuralı yeterli): her kullanıcı SADECE kendi
// bildirimlerini görür/okundu işaretler — bu, servis katmanında (NotificationService,
// getCurrentUser() ile) zorunlu kılınıyor, rol farketmeksizin.
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/list")
    public List<NotificationResponseDto> list() {
        return notificationService.getMyNotifications();
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount() {
        return Map.of("count", notificationService.getUnreadCount());
    }

    @PutMapping("/{id}/read")
    public void markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllRead() {
        notificationService.markAllAsRead();
    }
}
