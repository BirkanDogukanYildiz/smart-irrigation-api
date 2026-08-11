package com.belediye.bitkisulama.repository;

import com.belediye.bitkisulama.entity.User;
import com.belediye.bitkisulama.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    // Örn: tüm HEADGARDENER'ları listelemek için (kullanıcı/bölge atama ekranlarında dropdown doldurmak amacıyla)
    List<User> findByRole(Role role);

    // Belirli bir baş bahçivana bağlı tüm bahçivanları getirir (log filtreleme ve bölge görünürlüğü için)
    List<User> findByHeadGardenerId(Long headGardenerId);
}
