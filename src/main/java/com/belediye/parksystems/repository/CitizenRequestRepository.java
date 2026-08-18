package com.belediye.parksystems.repository;

import com.belediye.parksystems.entity.CitizenRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitizenRequestRepository extends JpaRepository<CitizenRequest, Long> {
    List<CitizenRequest> findAllByOrderByCreatedAtDesc();
}
