package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.UserRegisterRequestDto;
import com.belediye.bitkisulama.dto.UserResponseDto;
import com.belediye.bitkisulama.entity.User;
import com.belediye.bitkisulama.exception.UsernameAlreadyExistsException;
import com.belediye.bitkisulama.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
}
