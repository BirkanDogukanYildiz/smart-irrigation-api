package com.belediye.parksystems.dto;

import com.belediye.parksystems.enums.RequestStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CitizenRequestStatusUpdateDto {

    @NotNull(message = "Durum belirtmelisiniz.")
    private RequestStatus status;

    // Opsiyonel: özellikle "İncelendi" işaretlenirken kullanılır ama HER durum
    // geçişinde gönderilebilir. Boş/null bırakılabilir.
    @Size(max = 1000, message = "Not en fazla 1000 karakter olabilir.")
    private String note;
}
