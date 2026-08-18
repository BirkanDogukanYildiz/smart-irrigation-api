package com.belediye.parksystems.dto;

import com.belediye.parksystems.enums.RequestTopic;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CitizenRequestCreateDto {

    @NotNull(message = "Konu seçmelisiniz.")
    private RequestTopic topic;

    @NotBlank(message = "Ad soyad boş olamaz.")
    @Size(max = 100, message = "Ad soyad en fazla 100 karakter olabilir.")
    private String fullName;

    // Opsiyonel: telefon veya e-posta
    @Size(max = 150, message = "İletişim bilgisi en fazla 150 karakter olabilir.")
    private String contact;

    // Opsiyonel: talebin hangi park/bölge ile ilgili olduğu (bkz. /api/public/regions)
    private Long regionId;

    @NotBlank(message = "Talep mesajı boş olamaz.")
    @Size(max = 1000, message = "Talep mesajı en fazla 1000 karakter olabilir.")
    private String message;
}
