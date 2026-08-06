package com.belediye.bitkisulama.entity;

import com.belediye.bitkisulama.enums.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "Irrigation_System", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"region_id", "deviceNo"})
})
public class SprinklerInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(unique = false, nullable = false)
    private Integer deviceNo;

    // Bahçivanın sistem üzerinden değiştirebildiği alan: cihaz çalışıyor mu, arızalı mı?
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.WORKING;

    // Sadece FAULTY durumundayken doldurulur, cihaz düzelince temizlenir
    @Column(length = 300)
    private String description;
}
