package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.LoginRequestDto;
import com.belediye.bitkisulama.dto.LoginResponseDto;
import com.belediye.bitkisulama.enums.Role;
import com.belediye.bitkisulama.entity.User;
import com.belediye.bitkisulama.repository.UserRepository;
import com.belediye.bitkisulama.security.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public LoginResponseDto login(@RequestBody LoginRequestDto loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
        } catch (AuthenticationException ex) {
            log.warn("Başarısız giriş denemesi: username={}", loginRequest.getUsername());
            throw ex;
        }

        // Authenticate başarılıysa kullanıcı veritabanında kesin var demektir
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(); // buraya asla düşmez ama derleyici için gerekli

        Role role = user.getRole();
        String token = jwtService.generateToken(user.getUsername());

        log.info("Başarılı giriş: username={}, role={}", user.getUsername(), role);
        return new LoginResponseDto(token, user.getUsername(), role);
    }
}
