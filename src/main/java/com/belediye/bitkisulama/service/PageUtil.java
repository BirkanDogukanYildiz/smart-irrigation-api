package com.belediye.bitkisulama.service;

import com.belediye.bitkisulama.dto.PageResponseDto;

import java.util.List;

// Cihazlar/kullanıcılar/loglar arama uç noktalarının ortak sayfalama mantığı —
// kod tekrarını önlemek için tek yerde.
final class PageUtil {

    private PageUtil() {}

    static <T> PageResponseDto<T> paginate(List<T> filtered, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = size <= 0 ? 20 : Math.min(size, 200); // 200 üst sınır: kazara tüm veriyi tek seferde çekmeyi önler
        int total = filtered.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil(total / (double) safeSize);
        int from = Math.min(safePage * safeSize, total);
        int to = Math.min(from + safeSize, total);
        List<T> content = filtered.subList(from, to);
        return new PageResponseDto<>(content, safePage, safeSize, total, totalPages);
    }
}
