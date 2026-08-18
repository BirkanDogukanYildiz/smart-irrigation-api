package com.belediye.parksystems.dto;

import com.belediye.parksystems.enums.Status;
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

    // Opsiyonel: arıza raporunda gösterilecek arıza türü (ör. "Vana Arızası").
    // Boş bırakılabilir, zorunlu değil.
    private String faultType;

    // Opsiyonel: arızayı gösteren fotoğraf, data-URL formatında (ör. "data:image/jpeg;base64,...").
    // Boş/null gönderilirse mevcut fotoğraf (varsa) korunur — sadece WORKING'e çekilince temizlenir.
    private String photoBase64;
}
