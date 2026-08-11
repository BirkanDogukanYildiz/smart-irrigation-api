package com.belediye.bitkisulama.dto;

import lombok.Getter;
import lombok.Setter;

// headGardenerId null gönderilirse atama kaldırılır (bahçivan "sahipsiz" hale gelir)
@Getter
@Setter
public class AssignHeadGardenerRequestDto {
    private Long headGardenerId;
}
