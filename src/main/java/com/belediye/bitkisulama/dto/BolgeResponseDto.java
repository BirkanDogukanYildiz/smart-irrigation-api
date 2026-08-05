package com.belediye.bitkisulama.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BolgeResponseDto {

    private Long id;
    private Integer ilceNo;
    private String ilceAd;
    private Integer bolgeNo;
    private String bolgeAd;
    private Integer sulamaAlanNo;
    private String sulamaAlanAd;
    private String aciklama;
}
