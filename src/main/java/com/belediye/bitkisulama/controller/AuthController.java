package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.LoginRequestDto;
import com.belediye.bitkisulama.dto.LoginResponseDto;
import com.belediye.bitkisulama.enums.Role;
import com.belediye.bitkisulama.entity.User;
import com.belediye.bitkisulama.repository.UserRepository;
import com.belediye.bitkisulama.security.JwtService;
import com.belediye.bitkisulama.service.AuditActions;
import com.belediye.bitkisulama.service.AuditLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final AuditLogService auditLogService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserRepository userRepository,
                          AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/login")
    public LoginResponseDto login(@RequestBody LoginRequestDto loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
        } catch (AuthenticationException ex) {
            log.warn("Başarısız giriş denemesi: username={}", loginRequest.getUsername());
            // Not: başarısız giriş denemeleri BİLİNÇLİ OLARAK İşlem Geçmişi'ne yazılmıyor.
            // Var olmayan/yanlış kullanıcı adlarıyla yapılan denemeleri loglamak, İşlem
            // Geçmişi'ni (gerçek kullanıcıların gerçek işlemlerini takip etmesi gereken bir
            // ekranı) spam'e çevirebilir; bu, "sadece gerçek işlemler için log türü ekle"
            // talimatıyla ayrı bir konu (brute-force izleme) olduğu için kapsam dışı bırakıldı.
            throw ex;
        }

        // Authenticate başarılıysa kullanıcı veritabanında kesin var demektir
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(); // buraya asla düşmez ama derleyici için gerekli

        Role role = user.getRole();
        String token = jwtService.generateToken(user.getUsername());

        log.info("Başarılı giriş: username={}, role={}", user.getUsername(), role);
        auditLogService.logLogin(user.getUsername(), role.name());

        return new LoginResponseDto(token, user.getUsername(), role);
    }

    // Frontend, kullanıcı "Çıkış Yap" dediğinde token'ı silmeden ÖNCE bu uç noktayı
    // çağırır; böylece gerçek bir "çıkış yapıldı" olayı loglanabilir. JWT stateless
    // olduğu için bu endpoint token'ı geçersiz KILMAZ (mevcut auth mimarisi bilinçli
    // olarak değiştirilmedi) — sadece işlemi kaydeder. Bu yüzden authenticated olması
    // gerekiyor (bkz. SecurityConfig: /api/auth/logout, genel /api/auth/** permitAll
    // kuralından önce ayrıca authenticated() olarak işaretlendi).
    @PostMapping("/logout")
    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return;

        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        String role = user != null && user.getRole() != null ? user.getRole().name() : null;

        log.info("Çıkış yapıldı: username={}", username);
        auditLogService.logAction(
                AuditActions.CIKIS_YAPILDI,
                AuditActions.KAYNAK_AUTH,
                null,
                "'" + username + "' sistemden çıkış yaptı.",
                null,
                null
        );
        // role parametresi logAction içinde SecurityContext'ten zaten otomatik okunuyor,
        // burada ayrıca kullanmaya gerek yok; değişken sadece okunabilirlik için tutuldu.
        if (role == null) {
            log.debug("Çıkış yapan kullanıcının rolü çözümlenemedi: username={}", username);
        }
    }
}
