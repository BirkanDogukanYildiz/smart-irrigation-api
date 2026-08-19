// Sistemde her "Region" kaydı aslında bir PARK ALANI'nı temsil eder ve üç seviyeli
// bir hiyerarşiye sahiptir: districtName = İlçe (ör. "Kadıköy"), regionName = Bölge
// (ör. "Sahil Bölgesi"), irrigationAreaName = o bölge içindeki somut Park Alanı
// (ör. "Yoğurtçu Parkı"). AYNI İLÇE + BÖLGE kombinasyonunda BİRDEN FAZLA park alanı
// (yani birden fazla Region satırı) olabilir — bu yüzden sadece "İlçe - Bölge"
// göstermek YETERSİZ ve BELİRSİZ: örn. haritada bir bölgeye zoom yaparken veya
// dropdown'larda seçim yaparken, aynı isimli birden fazla satır ayırt edilemiyordu.
// Bu fonksiyon artık park alanı bilgisi mevcutsa onu da ekliyor: "İlçe - Bölge - Park Alanı".
// Park alanı adı yoksa (irrigationAreaName boş/undefined — örn. bazı vatandaş tarafı
// DTO'larında henüz taşınmıyorsa) sessizce "İlçe - Bölge" formatına düşer, hata vermez.
export function regionDisplayName(region) {
  if (!region) return "—";
  const district = region.districtName?.trim() || "—";
  const name = region.regionName?.trim() || "—";
  const parkArea = region.irrigationAreaName?.trim();
  return parkArea ? `${district} - ${name} - ${parkArea}` : `${district} - ${name}`;
}
