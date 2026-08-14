package com.belediye.parksystems.dto;

import com.belediye.parksystems.enums.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDeleteResponseDto {
        private Long id;
        private String username;
        private Role role;
}