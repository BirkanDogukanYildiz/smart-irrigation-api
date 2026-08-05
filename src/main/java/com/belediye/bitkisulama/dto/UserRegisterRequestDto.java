package com.belediye.bitkisulama.dto;

import com.belediye.bitkisulama.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRegisterRequestDto {

    @NotBlank(message = "Kullanıcı adı boş olamaz!")
    private String username;

    @NotBlank(message = "Şifre boş olamaz!")
    @Size(min = 4, message = "Şifre en az 4 karakter olmalı!")
    private String password;

    @NotNull(message = "Rol boş olamaz! (ADMIN veya BAHCIVAN)")
    private Role role;
}
