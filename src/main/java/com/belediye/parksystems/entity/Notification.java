package com.belediye.parksystems.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// Bildirim sistemi: gerçek zamanlı (websocket/SSE) bir teknoloji EKLENMEDİ — mevcut
// mimariye uygun, düz REST tabanlı bir çözüm. Frontend bildirimleri sayfa açılışında
// ve zil ikonuna tıklanınca normal bir GET isteğiyle çeker (bkz. NotificationBell.jsx).
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "Bildirimler")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Bildirim kime ait — sadece bu kullanıcı görebilir/okundu işaretleyebilir.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 400)
    private String message;

    // "CIHAZ" gibi — AuditActions.KAYNAK_* sabitleriyle aynı sözlük kullanılıyor,
    // tutarlılık için. Frontend bu alana göre bildirime tıklanınca hangi detay
    // sayfasına gideceğine karar verir (örn. CIHAZ -> /cihazlar/{resourceId}).
    @Column(length = 30)
    private String resourceType;

    private Long resourceId;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
