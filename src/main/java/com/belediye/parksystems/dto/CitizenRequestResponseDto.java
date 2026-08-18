package com.belediye.parksystems.dto;

import com.belediye.parksystems.enums.RequestStatus;
import com.belediye.parksystems.enums.RequestTopic;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CitizenRequestResponseDto {
    private Long id;
    private RequestTopic topic;
    private String fullName;
    private String contact;
    private String regionName;
    private String districtName;
    private String message;
    private RequestStatus status;
    private LocalDateTime createdAt;
}
