package com.belediye.bitkisulama.dto;

import com.belediye.bitkisulama.entity.Durum;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SprinklerDurumUpdateDto {

    @NotNull(message = "Durum boş olamaz! (CALISIYOR veya ARIZALI)")
    private Durum durum;

    // ARIZALI seçildiğinde zorunlu; servis katmanında kontrol ediliyor
    // (CALISIYOR'a çekerken göndermeye gerek yok)
    private String aciklama;
}
