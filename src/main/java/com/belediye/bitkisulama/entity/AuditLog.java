package com.belediye.bitkisulama.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

// NOT: Mevcut kolonlar (username, action, details, timestamp) hiç değiştirilmedi —
// sadece daha ayrıntılı loglama için YENİ, nullable kolonlar eklendi. Eski satırlarda
// bu yeni alanlar null gelir, bu geriye dönük uyumluluğu bozmaz.
@Entity
@Getter
@Setter
@Table(name = "Islem_Gecmisi")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(nullable = false, length = 300)
    private String details;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    // ---- YENİ: daha ayrıntılı log için eklenen alanlar ----

    // İşlemi yapan kullanıcının o anki rolü (ADMIN/HEADGARDENER/GARDENER).
    // Login/logout gibi bazı işlemlerde de doludur; sistem tarafından tetiklenen
    // (kullanıcısız) işlemlerde null kalabilir.
    @Column(length = 20)
    private String userRole;

    // Etkilenen kaynağın türü: "CIHAZ", "BOLGE", "KULLANICI", "AUTH" gibi.
    // Frontend'de kaynak/tür filtresi için kullanılır.
    @Column(length = 30)
    private String resourceType;

    // Etkilenen kaydın id'si. Login/logout gibi belirli bir kaynağa bağlı olmayan
    // işlemlerde null kalır.
    @Column
    private Long resourceId;

    // Değişiklik öncesi durum (kısa, okunabilir metin). Oluşturma işlemlerinde null.
    @Column(length = 500)
    private String oldValue;

    // Değişiklik sonrası durum (kısa, okunabilir metin). Silme işlemlerinde null.
    @Column(length = 500)
    private String newValue;
}
