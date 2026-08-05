package com.belediye.bitkisulama.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "Bolgeler")
public class Bolge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Aynı ilçede birden fazla bölge olabildiği için artık unique DEĞİL
    @Column(nullable = false)
    private Integer ilceNo;

    @Column(length = 50, nullable = false)
    private String ilceAd;

    // Sistem tarafından otomatik atanır (BolgeService.saveBolge), bu yüzden unique kalmalı
    @Column(unique = true, nullable = false)
    private Integer bolgeNo;

    @Column(length = 50, nullable = false)
    private String bolgeAd;

    // Eskiden "sokak" olan alan artık "sulama alanı" oldu
    @Column(nullable = false)
    private Integer sulamaAlanNo;

    @Column(length = 50, nullable = false)
    private String sulamaAlanAd;

    @Column(length = 200)
    private String aciklama;
}
