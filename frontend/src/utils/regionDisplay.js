// Sistemde her "Region" kaydı aslında bir PARK/YEŞİL ALAN'ı temsil eder:
// districtName = İlçe/Bölge (ör. "Kadıköy"), regionName = o bölgedeki parkın adı
// (ör. "Yoğurtçu Parkı"). Önceden bazı ekranlarda sadece regionName gösteriliyordu,
// bu da bağlamsız/eksik görünüyordu. Artık TEK bir ortak fonksiyon üzerinden, her
// yerde tutarlı "İlçe - Park Adı" formatı kullanılıyor. Değerler DOĞRUDAN veritabanı
// alanlarından geliyor — burada hiçbir isim sabit (hardcoded) yazılmıyor.
export function regionDisplayName(region) {
  if (!region) return "—";
  const district = region.districtName?.trim() || "—";
  const name = region.regionName?.trim() || "—";
  return `${district} - ${name}`;
}
