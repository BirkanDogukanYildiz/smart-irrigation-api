package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.UserDeleteRequestDto;
import com.belediye.bitkisulama.dto.UserDeleteResponseDto;
import com.belediye.bitkisulama.dto.UserRegisterRequestDto;
import com.belediye.bitkisulama.dto.UserResponseDto;
import com.belediye.bitkisulama.entity.User;
import com.belediye.bitkisulama.entity.Region;
import com.belediye.bitkisulama.enums.Role;
import com.belediye.bitkisulama.exception.UsernameAlreadyExistsException;
import com.belediye.bitkisulama.repository.RegionRepository;
import com.belediye.bitkisulama.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    private UserResponseDto toDto(User entity) {
        User headGardener = entity.getHeadGardener();
        return new UserResponseDto(
                entity.getId(),
                entity.getUsername(),
                entity.getRole(),
                headGardener != null ? headGardener.getId() : null,
                headGardener != null ? headGardener.getUsername() : null
        );
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

        // DİKKAT: parola hiçbir zaman log'a yazılmaz, sadece kullanıcı adı + rol.
        auditLogService.logAction(
                AuditActions.KULLANICI_OLUSTURULDU,
                AuditActions.KAYNAK_KULLANICI,
                saved.getId(),
                "'" + saved.getUsername() + "' kullanıcısı (" + saved.getRole() + ") oluşturuldu.",
                null,
                saved.getUsername() + " - " + saved.getRole()
        );
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    // Bir bahçivanı (GARDENER) bir baş bahçivana (HEADGARDENER) bağlar. Admin tarafından çağrılır.
    // headGardenerId null gönderilirse bahçivan "sahipsiz" hale gelir (atama kaldırılır).
    @Transactional
    public UserResponseDto assignHeadGardener(Long gardenerId, Long headGardenerId) {
        User gardener = userRepository.findById(gardenerId)
                .orElseThrow(() -> new IllegalArgumentException("Kullanıcı bulunamadı: id=" + gardenerId));

        if (gardener.getRole() != Role.GARDENER) {
            throw new IllegalArgumentException(
                    "'" + gardener.getUsername() + "' bir bahçivan değil (" + gardener.getRole() + "), baş bahçivan ataması sadece GARDENER rolündeki kullanıcılara yapılabilir!"
            );
        }

        String oldHeadGardener = gardener.getHeadGardener() != null ? gardener.getHeadGardener().getUsername() : "Atanmadı";

        if (headGardenerId == null) {
            gardener.setHeadGardener(null);
        } else {
            User headGardener = userRepository.findById(headGardenerId)
                    .orElseThrow(() -> new IllegalArgumentException("Baş bahçivan bulunamadı: id=" + headGardenerId));
            if (headGardener.getRole() != Role.HEADGARDENER) {
                throw new IllegalArgumentException("'" + headGardener.getUsername() + "' bir baş bahçivan değil, bu ataması yapılamaz!");
            }
            gardener.setHeadGardener(headGardener);
        }

        User saved = userRepository.save(gardener);
        String newHeadGardener = saved.getHeadGardener() != null ? saved.getHeadGardener().getUsername() : "Atanmadı";
        log.info("Bahçivan-BaşBahçivan ataması güncellendi: gardener={}, headGardenerId={}", saved.getUsername(), headGardenerId);

        auditLogService.logAction(
                AuditActions.KULLANICI_GUNCELLENDI,
                AuditActions.KAYNAK_KULLANICI,
                saved.getId(),
                "'" + saved.getUsername() + "' kullanıcısının baş bahçivan ataması değiştirildi.",
                "Baş Bahçivan: " + oldHeadGardener,
                "Baş Bahçivan: " + newHeadGardener
        );
        return toDto(saved);
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
        String label = user.getUsername() + " - " + user.getRole();

        // Silinen kullanıcı bir Baş Bahçivan ise, ona bağlı bahçivanların ve bölgelerin
        // referansını önce temizlemek gerekiyor; yoksa veritabanı foreign key hatası verir.
        if (user.getRole() == Role.HEADGARDENER) {
            List<User> baglıGardenerlar = userRepository.findByHeadGardenerId(user.getId());
            baglıGardenerlar.forEach(g -> g.setHeadGardener(null));
            userRepository.saveAll(baglıGardenerlar);

            List<Region> baglıBolgeler = regionRepository.findByHeadGardenerId(user.getId());
            baglıBolgeler.forEach(r -> r.setHeadGardener(null));
            regionRepository.saveAll(baglıBolgeler);

            if (!baglıGardenerlar.isEmpty() || !baglıBolgeler.isEmpty()) {
                log.info("'{}' silinmeden önce {} bahçivan ve {} bölgenin ataması kaldırıldı.",
                        user.getUsername(), baglıGardenerlar.size(), baglıBolgeler.size());
            }
        }

        Long deletedId = user.getId();
        userRepository.delete(user);
        log.info("Kullanıcı silindi: id={}, username={}", deletedId, user.getUsername());

        auditLogService.logAction(
                AuditActions.KULLANICI_SILINDI,
                AuditActions.KAYNAK_KULLANICI,
                deletedId,
                "'" + deletedUserDto.getUsername() + "' kullanıcısı silindi.",
                label,
                null
        );

        return deletedUserDto;
    }

    // Server-side sayfalama/filtreleme/arama.
    @Transactional(readOnly = true)
    public com.belediye.bitkisulama.dto.PageResponseDto<UserResponseDto> searchUsers(int page, int size, Role role, String query) {
        List<User> all = userRepository.findAll();

        java.util.stream.Stream<User> stream = all.stream();
        if (role != null) stream = stream.filter(u -> u.getRole() == role);
        if (query != null && !query.isBlank()) {
            String q = query.toLowerCase();
            stream = stream.filter(u -> u.getUsername().toLowerCase().contains(q));
        }

        List<UserResponseDto> dtos = stream
                .sorted(java.util.Comparator.comparing(User::getUsername))
                .map(this::toDto)
                .toList();

        return PageUtil.paginate(dtos, page, size);
    }
}
