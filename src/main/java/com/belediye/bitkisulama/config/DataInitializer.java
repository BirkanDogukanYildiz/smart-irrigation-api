package com.belediye.bitkisulama.config;

import com.belediye.bitkisulama.enums.Role;
import com.belediye.bitkisulama.entity.User;
import com.belediye.bitkisulama.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Uygulama her başladığında çalışır; veritabanında hiç kullanıcı yoksa
// varsayılan test kullanıcılarını oluşturur. Böylece User tablosu boşken
// login yapabileceğin kimse olmaz diye baştan iki hesap hazır olur.
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createIfNotExists("admin", "1234", Role.ADMIN);
        createIfNotExists("bahcivan", "1234", Role.GARDENER);
    }

    private void createIfNotExists(String username, String rawPassword, Role role) {
        if (userRepository.existsByUsername(username)) {
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        userRepository.save(user);
        log.info(">>> Varsayılan kullanıcı oluşturuldu: username={}, role={}", username, role);
    }
}
