package com.belediye.bitkisulama.dto;

import com.belediye.bitkisulama.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {
    private String token;
    private String username;
    private Role role;
}
