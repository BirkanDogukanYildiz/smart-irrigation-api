package com.belediye.bitkisulama.dto;

import com.belediye.bitkisulama.enums.Status;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SprinklerStatusUpdateDto {

    @NotNull(message = "Status boş olamaz! (WORKING veya FAULTY)")
    private Status status;

    // FAULTY seçildiğinde zorunlu; servis katmanında kontrol ediliyor
    // (WORKING'e çekerken göndermeye gerek yok)
    private String description;
}
