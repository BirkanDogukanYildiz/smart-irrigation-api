package com.belediye.parksystems.repository;

import com.belediye.parksystems.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegionRepository extends JpaRepository<Region, Long> {

    // Var olan en büyük bölge numarasını döner (hiç kayıt yoksa null gelir)
    @Query("SELECT MAX(r.regionNo) FROM Region r")
    Integer findMaxRegionNo();

    // Belirli bir baş bahçivana atanmış tüm bölgeleri getirir (görünürlük filtrelemesi için)
    List<Region> findByHeadGardenerId(Long headGardenerId);
}
