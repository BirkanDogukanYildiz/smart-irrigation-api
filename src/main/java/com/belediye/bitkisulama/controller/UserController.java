package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.UserDeleteRequestDto;
import com.belediye.bitkisulama.dto.UserDeleteResponseDto;
import com.belediye.bitkisulama.dto.UserRegisterRequestDto;
import com.belediye.bitkisulama.dto.UserResponseDto;
import com.belediye.bitkisulama.service.UserService;
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
}

