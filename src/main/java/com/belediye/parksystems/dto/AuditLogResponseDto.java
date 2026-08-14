package com.belediye.parksystems.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class AuditLogResponseDto {
    private Long id;
    private String username;
    private String action;
    private String details;
    private LocalDateTime timestamp;

    // Yeni ayrıntı alanları (eski loglarda null olabilir, frontend bunu "—" gösterir)
    private String userRole;
    private String resourceType;
    private Long resourceId;
    private String oldValue;
    private String newValue;
}
