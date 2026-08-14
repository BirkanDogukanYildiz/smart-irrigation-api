package com.belediye.parksystems.dto;

import com.belediye.parksystems.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String username;
    private Role role;

    // Sadece GARDENER kullanıcılar için doludur: bağlı olduğu baş bahçivan (admin tarafından atanır)
    private Long headGardenerId;
    private String headGardenerUsername;
}
