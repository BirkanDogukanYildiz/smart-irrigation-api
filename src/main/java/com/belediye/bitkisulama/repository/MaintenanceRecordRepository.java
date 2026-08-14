package com.belediye.bitkisulama.repository;

import com.belediye.bitkisulama.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findByDeviceIdOrderByMaintenanceDateDesc(Long deviceId);
}
