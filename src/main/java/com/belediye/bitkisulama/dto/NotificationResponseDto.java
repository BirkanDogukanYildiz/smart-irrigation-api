package com.belediye.bitkisulama.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class NotificationResponseDto {
    private Long id;
    private String title;
    private String message;
    private String resourceType;
    private Long resourceId;
    private boolean read;
    private LocalDateTime createdAt;
}
