package com.belediye.bitkisulama.dto;

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
}