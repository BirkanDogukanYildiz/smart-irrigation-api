package com.belediye.bitkisulama.dto;

import com.belediye.bitkisulama.enums.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDeleteResponseDto {
        private Long id;
        private String username;
        private Role role;
}