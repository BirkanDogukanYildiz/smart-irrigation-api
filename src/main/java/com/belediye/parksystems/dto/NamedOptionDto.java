package com.belediye.parksystems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Var olan ilçe/park alanı listelerini frontend'e döndürmek için — kullanıcı
// numarayı elle girmesin diye (bkz. RegionForm.jsx: seç ya da yeni ekle).
@Getter
@Setter
@AllArgsConstructor
public class NamedOptionDto {
    private Integer no;
    private String name;
}
