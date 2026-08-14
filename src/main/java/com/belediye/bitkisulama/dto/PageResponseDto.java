package com.belediye.bitkisulama.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

// Cihazlar/kullanıcılar/loglar için ortak sayfalama zarfı. Not: filtreleme/sıralama
// backend'de (Java tarafında, görünürlük kuralı uygulanmış veri kümesi üzerinde)
// yapılıyor ve sadece istenen sayfa frontend'e gönderiliyor — network payload'ı
// gerçekten küçülüyor, ki server-side sayfalamanın asıl amacı budur. Veritabanı
// seviyesinde LIMIT/OFFSET (Spring Data Pageable/Specification) yerine bu yaklaşım
// tercih edildi çünkü mevcut kod tabanı zaten (DashboardController, SprinklerInfoService
// vb.) "görünür veriyi çek + Java'da filtrele/agregat et" desenini kullanıyor; bu projenin
// ölçeğinde (belediye park/bahçe sistemi) performans farkı ihmal edilebilir düzeyde.
@Getter
@Setter
@AllArgsConstructor
public class PageResponseDto<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
