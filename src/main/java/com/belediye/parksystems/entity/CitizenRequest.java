package com.belediye.parksystems.entity;

import com.belediye.parksystems.enums.RequestStatus;
import com.belediye.parksystems.enums.RequestTopic;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

// Vatandaş görünümünden (kimlik doğrulama GEREKTİRMEDEN, bkz. PublicController)
// oluşturulan talep/şikayet kaydı. "Talepler" sayfasında (sadece ADMIN+HEADGARDENER)
// kronolojik bir log gibi listelenir, konuya göre filtrelenebilir.
@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "citizen_request")
public class CitizenRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RequestTopic topic;

    @Column(nullable = false, length = 100)
    private String fullName;

    // Opsiyonel: telefon veya e-posta — vatandaş geri dönüş istemiyorsa boş bırakabilir.
    @Column(length = 150)
    private String contact;

    // Opsiyonel: talebin hangi park/bölge ile ilgili olduğu. Bölge silinirse talep
    // geçmişi (kim ne dedi) bozulmasın diye SET NULL davranışı yeterli — bu yüzden
    // nullable FK, ON DELETE davranışı JPA'da varsayılan (kısıtlama yok, ddl-auto=create
    // ile şema her başlangıçta yeniden kurulduğundan pratikte sorun teşkil etmiyor).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id")
    private Region region;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.YENI;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
