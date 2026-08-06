package com.belediye.bitkisulama.controller;

import com.belediye.bitkisulama.dto.DashboardResponseDto;
import com.belediye.bitkisulama.enums.Status;
import com.belediye.bitkisulama.repository.RegionRepository;
import com.belediye.bitkisulama.repository.SprinklerInfoRepository;
import com.belediye.bitkisulama.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final RegionRepository regionRepository;
    private final SprinklerInfoRepository sprinklerInfoRepository;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public DashboardResponseDto getSummary() {
        DashboardResponseDto dto = new DashboardResponseDto();
        dto.setTotalRegions(regionRepository.count());
        dto.setTotalDevices(sprinklerInfoRepository.count());
        dto.setWorkingDevices(sprinklerInfoRepository.countByStatus(Status.WORKING));
        dto.setFaultyDevices(sprinklerInfoRepository.countByStatus(Status.FAULTY));
        dto.setTotalUsers(userRepository.count());
        return dto;
    }
}