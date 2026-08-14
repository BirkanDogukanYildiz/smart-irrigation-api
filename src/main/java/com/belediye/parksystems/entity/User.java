package com.belediye.parksystems.entity;

import com.belediye.parksystems.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "Kullanicilar")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    // Şifre her zaman BCrypt ile hash'lenmiş halde tutulur, asla düz metin değil
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    // Sadece role=GARDENER için anlamlıdır: bu bahçivanın bağlı olduğu baş bahçivan.
    // Admin tarafından atanır (bkz. UserService.assignHeadGardener). Bahçivanın hangi
    // bölgeleri görebileceği bu alana göre belirlenir (RegionService.getVisibleRegionEntities).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "head_gardener_id")
    private User headGardener;
}
