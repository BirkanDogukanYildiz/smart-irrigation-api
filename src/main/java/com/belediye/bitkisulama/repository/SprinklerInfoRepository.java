package com.belediye.bitkisulama.repository;

import com.belediye.bitkisulama.entity.SprinklerInfo;
import com.belediye.bitkisulama.enums.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface SprinklerInfoRepository extends JpaRepository<SprinklerInfo, Long> {
    long countByRegionId(Long regionId);
    long countByStatus(com.belediye.bitkisulama.enums.Status status);

    // Faz 3.2 (vatandaş şeffaflık özeti): tür bazlı dağılım için
    long countByAssetType(AssetType assetType);

    // Dashboard agregasyon endpoint'i: görünürlük kuralına uyan (visible) bölgelerin
    // tüm cihazlarını TEK sorguda çekip bölge/tür/arıza kırılımlarını Java tarafında
    // hesaplamak için. Region bazında ayrı ayrı count sorgusu atmaktan daha verimli.
    List<SprinklerInfo> findByRegionIdIn(Collection<Long> regionIds);
}
