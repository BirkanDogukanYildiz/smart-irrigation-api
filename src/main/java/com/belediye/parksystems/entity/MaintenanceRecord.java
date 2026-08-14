package com.belediye.parksystems.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "Bakim_Kayitlari")
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private SprinklerInfo device;

    @Column(nullable = false)
    private LocalDate maintenanceDate;

    // Opsiyonel: planlanan bir sonraki bakım yoksa null.
    private LocalDate nextMaintenanceDate;

    @Column(length = 500)
    private String description;

    // Bakımı yapan personelin kullanıcı adı (JWT authentication'dan alınır, User FK
    // yerine string tutuluyor — SprinklerInfo.lastUpdatedBy ile aynı, kanıtlanmış desen).
    @Column(length = 50)
    private String performedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
