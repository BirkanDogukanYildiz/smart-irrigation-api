package com.belediye.bitkisulama.dto;

import com.belediye.bitkisulama.enums.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SprinklerDurumUpdateDto {

    @NotNull(message = "Status boş olamaz! (CALISIYOR veya ARIZALI)")
    private Status status;

    // ARIZALI seçildiğinde zorunlu; servis katmanında kontrol ediliyor
    // (CALISIYOR'a çekerken göndermeye gerek yok)
    private String aciklama;
}
