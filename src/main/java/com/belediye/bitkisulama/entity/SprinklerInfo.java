package com.belediye.bitkisulama.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "Sulama_Sistemi", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"bolge_id", "sulamaCihazNo"})
})
public class SprinklerInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bolge_id", nullable = false)
    private Bolge bolge;

    @Column(unique = false, nullable = false)
    private Integer sulamaCihazNo;

    // Bahçivanın sistem üzerinden değiştirebildiği alan: cihaz çalışıyor mu, arızalı mı?
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Durum durum = Durum.CALISIYOR;

    // Sadece ARIZALI durumundayken doldurulur, cihaz düzelince temizlenir
    @Column(length = 300)
    private String aciklama;
}