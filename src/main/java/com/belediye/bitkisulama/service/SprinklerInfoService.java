package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.BolgeResponseDto;
import com.belediye.bitkisulama.dto.SprinklerInfoRequestDto;
import com.belediye.bitkisulama.dto.SprinklerInfoResponseDto;
import com.belediye.bitkisulama.entity.Bolge;
import com.belediye.bitkisulama.entity.Durum;
import com.belediye.bitkisulama.entity.SprinklerInfo;
import com.belediye.bitkisulama.exception.DeviceNotFoundException;
import com.belediye.bitkisulama.repository.SprinklerInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SprinklerInfoService {

    private final SprinklerInfoRepository sprinklerInfoRepository;
    private final BolgeService bolgeService;

    // ---- YARDIMCI (private) METODLAR ----

    private SprinklerInfo toEntity(SprinklerInfoRequestDto dto) {
        Bolge bolge = bolgeService.getBolgeEntity(dto.getBolgeId());

        SprinklerInfo entity = new SprinklerInfo();
        entity.setBolge(bolge);
        entity.setSulamaCihazNo(dto.getSulamaCihazNo());
        entity.setDurum(Durum.CALISIYOR); // yeni cihaz her zaman "çalışıyor" olarak başlar
        return entity;
    }

    private SprinklerInfoResponseDto toDto(SprinklerInfo entity) {
        Bolge bolge = entity.getBolge();
        BolgeResponseDto bolgeDto = new BolgeResponseDto(
                bolge.getId(),
                bolge.getIlceNo(),
                bolge.getIlceAd(),
                bolge.getBolgeNo(),
                bolge.getBolgeAd(),
                bolge.getSulamaAlanNo(),
                bolge.getSulamaAlanAd(),
                bolge.getAciklama()
        );

        return new SprinklerInfoResponseDto(
                entity.getId(),
                bolgeDto,
                entity.getSulamaCihazNo(),
                entity.getDurum(),
                entity.getAciklama()
        );
    }

    // ---- ASIL METODLAR ----

    @Transactional
    public SprinklerInfoResponseDto deviceSave(SprinklerInfoRequestDto dto) {
        SprinklerInfo saved = sprinklerInfoRepository.save(toEntity(dto));
        log.info("Yeni cihaz kaydedildi: id={}, bolgeId={}", saved.getId(), dto.getBolgeId());
        return toDto(saved);
    }

    @Transactional
    public List<SprinklerInfoResponseDto> deviceSaveAll(List<SprinklerInfoRequestDto> newSaveAll) {
        List<SprinklerInfo> entities = newSaveAll.stream()
                .map(this::toEntity)
                .toList();

        List<SprinklerInfo> saved = sprinklerInfoRepository.saveAll(entities);

        return saved.stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SprinklerInfoResponseDto> sprinklerDeviceGeneral() {
        return sprinklerInfoRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void deviceDelete(Long id) {
        if (sprinklerInfoRepository.existsById(id)) {
            sprinklerInfoRepository.deleteById(id);
            log.info("Cihaz silindi: id={}", id);
        } else {
            log.warn("Silinmek istenen cihaz bulunamadı: id={}", id);
            throw new DeviceNotFoundException(id);
        }
    }

    @Transactional
    public SprinklerInfoResponseDto deviceUpdate(Long id, SprinklerInfoRequestDto updatedInfo) {
        SprinklerInfo devicePresent = sprinklerInfoRepository.findById(id)
                .orElseThrow(() -> new DeviceNotFoundException(id));

        Bolge bolge = bolgeService.getBolgeEntity(updatedInfo.getBolgeId());
        devicePresent.setBolge(bolge);
        devicePresent.setSulamaCihazNo(updatedInfo.getSulamaCihazNo());

        SprinklerInfo saved = sprinklerInfoRepository.save(devicePresent);
        log.info("Cihaz güncellendi: id={}", saved.getId());
        return toDto(saved);
    }

    // Bahçivanın/adminin kullandığı: durum + (arızalıysa) açıklama değiştirme
    @Transactional
    public SprinklerInfoResponseDto updateDurum(Long id, Durum yeniDurum, String aciklama) {
        SprinklerInfo device = sprinklerInfoRepository.findById(id)
                .orElseThrow(() -> new DeviceNotFoundException(id));

        if (yeniDurum == Durum.ARIZALI && (aciklama == null || aciklama.isBlank())) {
            throw new IllegalArgumentException("Cihazı arızalı olarak işaretlerken açıklama girmek zorunludur!");
        }

        device.setDurum(yeniDurum);
        // Cihaz "çalışıyor" olarak işaretlenince eski arıza açıklaması temizlenir
        device.setAciklama(yeniDurum == Durum.ARIZALI ? aciklama : null);

        SprinklerInfo saved = sprinklerInfoRepository.save(device);
        log.info("Cihaz durumu güncellendi: id={}, yeniDurum={}", saved.getId(), yeniDurum);
        return toDto(saved);
    }

    public SprinklerInfoResponseDto deviceInfo(Long id) {
        SprinklerInfo entity = sprinklerInfoRepository.findById(id)
                .orElseThrow(() -> new DeviceNotFoundException(id));
        return toDto(entity);
    }
}
