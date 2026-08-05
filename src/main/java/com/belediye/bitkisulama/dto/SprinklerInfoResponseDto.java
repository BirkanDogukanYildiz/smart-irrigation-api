package com.belediye.bitkisulama.dto;

import com.belediye.bitkisulama.entity.Durum;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SprinklerInfoResponseDto {

    private Long id;
    private BolgeResponseDto bolge;
    private Integer sulamaCihazNo;
    private Durum durum;
    private String aciklama;
}
