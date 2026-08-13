package com.belediye.bitkisulama.dto;

import lombok.Getter;
import lombok.Setter;

// Haritada çizilen bölge sınırını kaydetmek için ayrı, minimal bir istek gövdesi.
// boundary null/boş gönderilirse mevcut zone kaldırılmış olur (admin "sınırı sil" diyebilsin diye).
@Getter
@Setter
public class RegionBoundaryRequestDto {
    private String boundary;
}
