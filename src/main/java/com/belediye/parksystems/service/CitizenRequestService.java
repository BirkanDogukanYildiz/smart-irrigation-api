package com.belediye.parksystems.service;

import com.belediye.parksystems.dto.CitizenRequestCreateDto;
import com.belediye.parksystems.dto.CitizenRequestResponseDto;
import com.belediye.parksystems.entity.CitizenRequest;
import com.belediye.parksystems.entity.Region;
import com.belediye.parksystems.enums.RequestStatus;
import com.belediye.parksystems.enums.RequestTopic;
import com.belediye.parksystems.exception.RequestNotFoundException;
import com.belediye.parksystems.repository.CitizenRequestRepository;
import com.belediye.parksystems.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Vatandaş talepleri: oluşturma kimlik doğrulama GEREKTİRMEZ (bkz. PublicController +
// SecurityConfig'te POST /api/public/requests permitAll). Listeleme/inceleme ise
// "Talepler" sayfası üzerinden sadece ADMIN+HEADGARDENER'a açık (bkz. RequestController),
// İşlem Geçmişi (loglar) ile aynı yetki seviyesi kullanılıyor çünkü ikisi de vatandaşla
// ilgili değil, iç yönetim/denetim amaçlı.
@Slf4j
@Service
@RequiredArgsConstructor
public class CitizenRequestService {

    private final CitizenRequestRepository citizenRequestRepository;
    private final RegionRepository regionRepository;
    private final AuditLogService auditLogService;

    private CitizenRequestResponseDto toDto(CitizenRequest entity) {
        CitizenRequestResponseDto dto = new CitizenRequestResponseDto();
        dto.setId(entity.getId());
        dto.setTopic(entity.getTopic());
        dto.setFullName(entity.getFullName());
        dto.setContact(entity.getContact());
        if (entity.getRegion() != null) {
            dto.setRegionName(entity.getRegion().getRegionName());
            dto.setDistrictName(entity.getRegion().getDistrictName());
        }
        dto.setMessage(entity.getMessage());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    @Transactional
    public CitizenRequestResponseDto createRequest(CitizenRequestCreateDto dto) {
        CitizenRequest entity = new CitizenRequest();
        entity.setTopic(dto.getTopic());
        entity.setFullName(dto.getFullName().trim());
        entity.setContact(dto.getContact() != null && !dto.getContact().isBlank() ? dto.getContact().trim() : null);
        entity.setMessage(dto.getMessage().trim());
        entity.setStatus(RequestStatus.YENI);

        if (dto.getRegionId() != null) {
            Region region = regionRepository.findById(dto.getRegionId()).orElse(null);
            entity.setRegion(region); // bölge bulunamazsa sessizce null bırakılır — talep formu reddedilmemeli
        }

        CitizenRequest saved = citizenRequestRepository.save(entity);
        log.info("Yeni vatandaş talebi oluşturuldu: id={}, topic={}", saved.getId(), saved.getTopic());

        auditLogService.logAction(
                AuditActions.TALEP_OLUSTURULDU,
                AuditActions.KAYNAK_TALEP,
                saved.getId(),
                "'" + saved.getFullName() + "' tarafından yeni bir talep oluşturuldu (konu: " + saved.getTopic() + ").",
                null,
                saved.getTopic().toString()
        );

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CitizenRequestResponseDto> listRequests(RequestTopic topic, RequestStatus status) {
        var stream = citizenRequestRepository.findAllByOrderByCreatedAtDesc().stream();
        if (topic != null) stream = stream.filter(r -> r.getTopic() == topic);
        if (status != null) stream = stream.filter(r -> r.getStatus() == status);
        return stream.map(this::toDto).toList();
    }

    @Transactional
    public CitizenRequestResponseDto markReviewed(Long id) {
        CitizenRequest entity = citizenRequestRepository.findById(id)
                .orElseThrow(() -> new RequestNotFoundException(id));
        entity.setStatus(RequestStatus.INCELENDI);
        CitizenRequest saved = citizenRequestRepository.save(entity);

        auditLogService.logAction(
                AuditActions.TALEP_INCELENDI,
                AuditActions.KAYNAK_TALEP,
                saved.getId(),
                "'" + saved.getFullName() + "' tarafından oluşturulan talep incelendi olarak işaretlendi.",
                RequestStatus.YENI.toString(),
                RequestStatus.INCELENDI.toString()
        );

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<com.belediye.parksystems.dto.PublicRegionOptionDto> listPublicRegionOptions() {
        return regionRepository.findAll().stream()
                .map(r -> new com.belediye.parksystems.dto.PublicRegionOptionDto(r.getId(), r.getRegionName(), r.getDistrictName()))
                .toList();
    }
}
