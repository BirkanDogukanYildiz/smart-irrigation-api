package com.belediye.parksystems.config;

import com.belediye.parksystems.entity.Region;
import com.belediye.parksystems.entity.SprinklerInfo;
import com.belediye.parksystems.enums.AssetType;
import com.belediye.parksystems.enums.Role;
import com.belediye.parksystems.entity.User;
import com.belediye.parksystems.repository.RegionRepository;
import com.belediye.parksystems.repository.SprinklerInfoRepository;
import com.belediye.parksystems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Uygulama her başladığında çalışır; veritabanında hiç kullanıcı yoksa
// varsayılan test kullanıcılarını oluşturur. Böylece User tablosu boşken
// login yapabileceğin kimse olmaz diye baştan iki hesap hazır olur.
//
// Faz 3.1 (mimari genelleme): ayrıca, sistemde hiç ekipman kaydı yokken birkaç
// farklı türde (SULAMA_CIHAZI dışında AYDINLATMA, BANK) demo ekipman ekler.
// Amaç: "model artık genel park ekipmanına açık" iddiasını uçtan uca, somut
// çalışan veriyle göstermek. Zaten veri varsa (gerçek kullanım başlamışsa)
// hiçbir şeye dokunmaz.
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RegionRepository regionRepository;
    private final SprinklerInfoRepository sprinklerInfoRepository;

    @Override
    public void run(String... args) {
        createIfNotExists("admin", "1234", Role.ADMIN);
        createIfNotExists("bas_bahcivan", "1234", Role.HEADGARDENER);
        createIfNotExists("bahcivan", "1234", Role.GARDENER);
        createDemoAssetsIfNotExists();
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

    private void createDemoAssetsIfNotExists() {
        // Sistemde zaten herhangi bir ekipman kaydı varsa (gerçek kullanım
        // başlamış demektir) demo veri eklemiyoruz; üretim verisiyle karışmasın.
        if (sprinklerInfoRepository.count() > 0) {
            return;
        }

        Region demoRegion = regionRepository.findAll().stream().findFirst().orElseGet(() -> {
            Region r = new Region();
            r.setDistrictNo(1);
            r.setDistrictName("Demo İlçe");
            Integer maxNo = regionRepository.findMaxRegionNo();
            r.setRegionNo((maxNo == null ? 0 : maxNo) + 1);
            r.setRegionName("Demo Bölge");
            r.setIrrigationAreaNo(1);
            r.setIrrigationAreaName("Demo Alan");
            r.setDescription("Genel ekipman modeli demosu için otomatik oluşturuldu.");
            Region saved = regionRepository.save(r);
            log.info(">>> Demo bölge oluşturuldu: id={}, regionName={}", saved.getId(), saved.getRegionName());
            return saved;
        });

        saveDemoAsset(demoRegion, 1, AssetType.SULAMA_CIHAZI);
        saveDemoAsset(demoRegion, 2, AssetType.AYDINLATMA);
        saveDemoAsset(demoRegion, 3, AssetType.BANK);

        log.info(">>> Demo ekipman kayıtları oluşturuldu (SULAMA_CIHAZI, AYDINLATMA, BANK) - bölge: {}",
                demoRegion.getRegionName());
    }

    private void saveDemoAsset(Region region, int deviceNo, AssetType type) {
        SprinklerInfo asset = new SprinklerInfo();
        asset.setRegion(region);
        asset.setDeviceNo(deviceNo);
        asset.setAssetType(type);
        sprinklerInfoRepository.save(asset);
    }
}
