package com.belediye.parksystems.controller;

import com.belediye.parksystems.dto.AssignHeadGardenerRequestDto;
import com.belediye.parksystems.dto.UserDeleteRequestDto;
import com.belediye.parksystems.dto.UserDeleteResponseDto;
import com.belediye.parksystems.dto.UserRegisterRequestDto;
import com.belediye.parksystems.dto.UserResponseDto;
import com.belediye.parksystems.dto.PageResponseDto;
import com.belediye.parksystems.enums.Role;
import com.belediye.parksystems.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Bu controller'ın tamamı SecurityConfig'te ADMIN rolüne kilitli (/api/user/**)
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserResponseDto register(@Valid @RequestBody UserRegisterRequestDto dto) {
        return userService.register(dto);
    }

    @DeleteMapping("/delete")
    public UserDeleteResponseDto deleteUser(@Valid @RequestBody UserDeleteRequestDto dto) {
        return userService.deleteUser(dto);
    }
    @GetMapping("/list")
    public List<UserResponseDto> listUsers() {
        return userService.listUsers();
    }

    // Server-side sayfalama/filtreleme/arama.
    @GetMapping("/search")
    public PageResponseDto<UserResponseDto> searchUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) String q
    ) {
        return userService.searchUsers(page, size, role, q);
    }

    // Bir bahçivanı bir baş bahçivana bağlar (ya da headGardenerId=null göndererek atamayı kaldırır)
    @PutMapping("/{id}/head-gardener")
    public UserResponseDto assignHeadGardener(@PathVariable Long id, @RequestBody AssignHeadGardenerRequestDto dto) {
        return userService.assignHeadGardener(id, dto.getHeadGardenerId());
    }
}

