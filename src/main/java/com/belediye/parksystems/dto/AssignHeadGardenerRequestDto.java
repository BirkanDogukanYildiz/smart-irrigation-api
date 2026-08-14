package com.belediye.parksystems.dto;

import lombok.Getter;
import lombok.Setter;

// headGardenerId null gönderilirse atama kaldırılır (bahçivan "sahipsiz" hale gelir)
@Getter
@Setter
public class AssignHeadGardenerRequestDto {
    private Long headGardenerId;
}
