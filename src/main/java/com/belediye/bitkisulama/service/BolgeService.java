package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.BolgeRequestDto;
import com.belediye.bitkisulama.dto.BolgeResponseDto;
import com.belediye.bitkisulama.entity.Bolge;
import com.belediye.bitkisulama.exception.BolgeNotFoundException;
import com.belediye.bitkisulama.exception.BolgeSilinemezException;
import com.belediye.bitkisulama.repository.BolgeRepository;
import com.belediye.bitkisulama.repository.SprinklerInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BolgeService {

    private final BolgeRepository bolgeRepository;
    private final SprinklerInfoRepository sprinklerInfoRepository;

    private BolgeResponseDto toDto(Bolge entity) {
        return new BolgeResponseDto(
                entity.getId(),
                entity.getIlceNo(),
                entity.getIlceAd(),
                entity.getBolgeNo(),
                entity.getBolgeAd(),
                entity.getSulamaAlanNo(),
                entity.getSulamaAlanAd(),
                entity.getAciklama()
        );
    }

    // Bölge numarasını sistem otomatik üretir: mevcut en büyük numara + 1
    private Integer sonrakiBolgeNo() {
        Integer maxNo = bolgeRepository.findMaxBolgeNo();
        return (maxNo == null ? 0 : maxNo) + 1;
    }

    @Transactional
    public BolgeResponseDto saveBolge(BolgeRequestDto dto) {
        Bolge entity = new Bolge();
        entity.setIlceNo(dto.getIlceNo());
        entity.setIlceAd(dto.getIlceAd());
        entity.setBolgeNo(sonrakiBolgeNo()); // <-- otomatik atama, kullanıcıdan alınmıyor
        entity.setBolgeAd(dto.getBolgeAd());
        entity.setSulamaAlanNo(dto.getSulamaAlanNo());
        entity.setSulamaAlanAd(dto.getSulamaAlanAd());
        entity.setAciklama(dto.getAciklama());

        Bolge saved = bolgeRepository.save(entity);
        log.info("Yeni bölge kaydedildi: id={}, bolgeNo={} (otomatik), bolgeAd={}",
                saved.getId(), saved.getBolgeNo(), saved.getBolgeAd());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BolgeResponseDto> listBolges() {
        return bolgeRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public BolgeResponseDto getBolgeInfo(Long id) {
        Bolge entity = bolgeRepository.findById(id)
                .orElseThrow(() -> new BolgeNotFoundException(id));
        return toDto(entity);
    }

    @Transactional
    public BolgeResponseDto updateBolge(Long id, BolgeRequestDto dto) {
        Bolge bolgePresent = bolgeRepository.findById(id)
                .orElseThrow(() -> new BolgeNotFoundException(id));

        // bolgeNo'ya dokunulmuyor: bir kez otomatik atandıktan sonra sabit kalır
        bolgePresent.setIlceNo(dto.getIlceNo());
        bolgePresent.setIlceAd(dto.getIlceAd());
        bolgePresent.setBolgeAd(dto.getBolgeAd());
        bolgePresent.setSulamaAlanNo(dto.getSulamaAlanNo());
        bolgePresent.setSulamaAlanAd(dto.getSulamaAlanAd());
        bolgePresent.setAciklama(dto.getAciklama());

        Bolge saved = bolgeRepository.save(bolgePresent);
        log.info("Bölge güncellendi: id={}", saved.getId());
        return toDto(saved);
    }

    @Transactional
    public void deleteBolge(Long id) {
        Bolge bolge = bolgeRepository.findById(id)
                .orElseThrow(() -> new BolgeNotFoundException(id));

        long bagliCihazSayisi = sprinklerInfoRepository.countByBolgeId(id);
        if (bagliCihazSayisi > 0) {
            throw new BolgeSilinemezException(id, bagliCihazSayisi);
        }

        bolgeRepository.delete(bolge);
        log.info("Bölge silindi: id={}, bolgeAd={}", bolge.getId(), bolge.getBolgeAd());
    }
    // SprinklerInfoService'in kullanacağı, Entity dönen yardımcı metod
    public Bolge getBolgeEntity(Long id) {
        return bolgeRepository.findById(id)
                .orElseThrow(() -> new BolgeNotFoundException(id));
    }
}
