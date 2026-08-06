package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.UserDeleteRequestDto;
import com.belediye.bitkisulama.dto.UserDeleteResponseDto;
import com.belediye.bitkisulama.dto.UserRegisterRequestDto;
import com.belediye.bitkisulama.dto.UserResponseDto;
import com.belediye.bitkisulama.entity.User;
import com.belediye.bitkisulama.exception.UsernameAlreadyExistsException;
import com.belediye.bitkisulama.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private UserResponseDto toDto(User entity) {
        return new UserResponseDto(entity.getId(), entity.getUsername(), entity.getRole());
    }

    @Transactional
    public UserResponseDto register(UserRegisterRequestDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new UsernameAlreadyExistsException(dto.getUsername());
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword())); // şifre asla düz metin kaydedilmez
        user.setRole(dto.getRole());

        User saved = userRepository.save(user);
        log.info("Yeni kullanıcı oluşturuldu: username={}, role={}", saved.getUsername(), saved.getRole());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    private UserDeleteResponseDto toDeleteDto(User entity) {
        UserDeleteResponseDto dto = new UserDeleteResponseDto();
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setRole(entity.getRole());
        return dto;
    }
    @Transactional
    public UserDeleteResponseDto deleteUser(UserDeleteRequestDto dto) {
        User user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Silinmek istenen '" + dto.getUsername() + "' adlı kullanıcı bulunamadı!"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName().equals(user.getUsername())) {
            throw new IllegalArgumentException("Kendi hesabını silemezsin!");
        }

        UserDeleteResponseDto deletedUserDto = toDeleteDto(user);
        userRepository.delete(user);
        log.info("Kullanıcı silindi: id={}, username={}", user.getId(), user.getUsername());

        return deletedUserDto;
    }
}
