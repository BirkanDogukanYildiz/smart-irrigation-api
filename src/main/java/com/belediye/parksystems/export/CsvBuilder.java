package com.belediye.parksystems.export;

import java.util.List;

// Hiçbir harici kütüphane (Apache POI, iText vb.) EKLENMEDİ — bu sınıf sadece
// java.lang ile RFC 4180 uyumlu CSV üretir. CSV, Excel'de doğrudan açılabildiği
// için "Excel export" ihtiyacını gerçek bir dosya indirme deneyimiyle karşılıyor.
// UTF-8 BOM eklenir, aksi halde Excel Türkçe karakterleri (İ, ı, ş, ğ, ü, ö, ç)
// bozuk gösterir.
public final class CsvBuilder {

    private CsvBuilder() {}

    public static String build(List<String> headers, List<List<String>> rows) {
        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF'); // UTF-8 BOM
        sb.append(joinRow(headers));
        for (List<String> row : rows) {
            sb.append(joinRow(row));
        }
        return sb.toString();
    }

    private static String joinRow(List<String> values) {
        StringBuilder line = new StringBuilder();
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) line.append(';'); // TR Excel varsayılan ayracı noktalı virgüldür
            line.append(escape(values.get(i)));
        }
        line.append("\r\n");
        return line.toString();
    }

    private static String escape(String value) {
        if (value == null) return "";
        boolean needsQuote = value.contains(";") || value.contains("\"") || value.contains("\n") || value.contains("\r");
        String escaped = value.replace("\"", "\"\"");
        return needsQuote ? "\"" + escaped + "\"" : escaped;
    }
}
