package com.belediye.parksystems.entity;

import com.belediye.parksystems.enums.AssetType;
import com.belediye.parksystems.enums.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// NOT (Faz 3.1 - mimari genelleme): Bu entity artık sadece sulama cihazlarını değil,
// genel park ekipmanlarını (aydınlatma, bank, çöp kutusu, oyun grubu, kamera...) da
// temsil edebiliyor; bkz. assetType alanı ve AssetType enum'u.
//
// Bilinçli olarak yapılmadı: entity/tablo/endpoint isminin ("SprinklerInfo",
// "Irrigation_System", "/api/devices") tam değişimi.
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "Irrigation_System", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"region_id", "deviceNo"})
})
public class SprinklerInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(unique = false, nullable = false)
    private Integer deviceNo;

    // Bahçivanın sistem üzerinden değiştirebildiği alan: cihaz çalışıyor mu, arızalı mı?
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.WORKING;

    // Hangi tür saha ekipmanı olduğu. Varsayılan SULAMA_CIHAZI olduğu için mevcut
    // kayıtlar (migration öncesi) hiç bozulmadan çalışmaya devam eder.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AssetType assetType = AssetType.SULAMA_CIHAZI;

    // Harita üzerindeki konumu
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    // Sadece FAULTY durumundayken doldurulur, cihaz düzelince temizlenir
    @Column(length = 300)
    private String description;

    // Harita pin detayı / arıza raporu için: cihaz ilk oluşturulduğunda set edilir, değişmez.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // "Son çalışma zamanı" / "son güncelleme": durum her değiştiğinde (WORKING<->FAULTY) güncellenir.
    @Column(nullable = false)
    private LocalDateTime statusChangedAt;

    // Arıza raporu için: sadece FAULTY durumundayken doldurulur, cihaz düzelince temizlenir
    // (description ile aynı yaşam döngüsü). Serbest metin, örn. "Vana Arızası", "Elektrik Kesintisi".
    @Column(length = 100)
    private String faultType;

    // Durumu en son değiştiren kullanıcının adı (JWT authentication'dan alınır).
    // "İlgili personel" bilgisini fake veri üretmeden, gerçek işlem sahibinden gösterebilmek için.
    @Column(length = 50)
    private String lastUpdatedBy;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.statusChangedAt = now;
    }
}
