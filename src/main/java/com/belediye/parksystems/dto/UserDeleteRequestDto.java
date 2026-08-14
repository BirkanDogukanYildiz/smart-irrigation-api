package com.belediye.parksystems.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDeleteRequestDto {

    @NotBlank(message = "Kullanıcı adı boş olamaz!")
    private String username;
}