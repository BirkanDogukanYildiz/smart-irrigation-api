package com.belediye.parksystems.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "Regions")
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Aynı ilçede birden fazla bölge olabildiği için artık unique DEĞİL
    @Column(nullable = false)
    private Integer districtNo;

    @Column(length = 50, nullable = false)
    private String districtName;

    // Sistem tarafından otomatik atanır (RegionService.saveRegion), bu yüzden unique kalmalı
    @Column(unique = true, nullable = false)
    private Integer regionNo;

    @Column(length = 50, nullable = false)
    private String regionName;

    // Eskiden "sokak" olan alan artık "sulama alanı" oldu
    @Column(nullable = false)
    private Integer irrigationAreaNo;

    @Column(length = 50, nullable = false)
    private String irrigationAreaName;

    @Column(length = 200)
    private String description;

    // Bu bölgeden sorumlu baş bahçivan. Admin tarafından atanır (bkz. RegionService.assignHeadGardener).
    // Gardener'lar hangi bölgeleri görebileceğini bu alan üzerinden (kendi headGardener'ları ile eşleştirerek) belirler.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "head_gardener_id")
    private User headGardener;

    // Haritada bölgenin sınırını (zone) çizen çokgenin köşe noktaları.
    // JSON string olarak saklanır: "[[lat,lng],[lat,lng],...]" (Leaflet L.polygon formatına birebir uyumlu).
    // Admin haritadan çizip kaydetmeden önce null'dır — bölge o zamana kadar haritada zone olarak görünmez,
    // ama var olan cihazlarıyla (varsa) haritada görünmeye devam eder.
    @Lob
    @Column(columnDefinition = "TEXT")
    private String boundary;
}
