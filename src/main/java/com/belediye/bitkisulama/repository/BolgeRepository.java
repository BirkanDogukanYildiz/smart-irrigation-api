package com.belediye.bitkisulama.repository;

import com.belediye.bitkisulama.entity.Bolge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BolgeRepository extends JpaRepository<Bolge, Long> {

    // Var olan en büyük bölge numarasını döner (hiç kayıt yoksa null gelir)
    @Query("SELECT MAX(b.bolgeNo) FROM Bolge b")
    Integer findMaxBolgeNo();
}
