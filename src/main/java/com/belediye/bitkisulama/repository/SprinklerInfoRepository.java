package com.belediye.bitkisulama.repository;

import com.belediye.bitkisulama.entity.SprinklerInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SprinklerInfoRepository extends JpaRepository<SprinklerInfo, Long> {
    long countByRegionId(Long regionId);
}