// Personel haritası (DeviceMap.jsx) ve vatandaş haritası (CitizenParkMap.jsx) AYNI
// koordinat/veri modelini kullanır: Region.boundary, backend'de "[[lat,lng],[lat,lng],...]"
// formatında bir JSON string olarak saklanır (bkz. Region entity, Leaflet L.polygon
// formatına birebir uyumlu). Bu dosya bu formatı parse eden ve polygon'un geometrik
// merkezini (centroid) hesaplayan TEK ortak yer — iki harita da aynı fonksiyonu
// çağırır, kendi ayrı parse/hesaplama mantığı YAZMAZ.

// boundary: backend'den gelen ham JSON string ("[[lat,lng],...]") | null
// dönüş: [[lat,lng], ...] dizisi | null (parse edilemezse veya 3'ten az nokta varsa)
export function parseBoundary(boundary) {
  if (!boundary) return null;
  try {
    const coords = JSON.parse(boundary);
    if (Array.isArray(coords) && coords.length >= 3) return coords;
    return null;
  } catch {
    return null;
  }
}

// Bir çokgenin GERÇEK geometrik merkezini (alan ağırlıklı centroid) hesaplar —
// köşe noktalarının basit ortalaması DEĞİL. Düzensiz (simetrik olmayan) park
// alanlarında köşe ortalaması merkezden belirgin şekilde kayabildiği için bu,
// vatandaş haritasındaki pini gerçek park alanının ortasına yerleştirmek adına
// bilinçli olarak tercih edildi. Standart poligon centroid formülü (shoelace
// tabanlı) kullanılıyor.
//
// coords: [[lat,lng], [lat,lng], ...] (en az 3 nokta)
// dönüş: [lat, lng] | null
export function polygonCentroid(coords) {
  if (!Array.isArray(coords) || coords.length < 3) return null;

  // Leaflet [lat,lng] sırasında tutuyor; standart centroid formülü x/y (yani lng/lat)
  // sırasıyla çalışır — burada x=lng, y=lat olarak eşliyoruz, sonucu tekrar [lat,lng]'e çeviriyoruz.
  let area = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < coords.length; i++) {
    const [lat1, lng1] = coords[i];
    const [lat2, lng2] = coords[(i + 1) % coords.length];
    const cross = lng1 * lat2 - lng2 * lat1;
    area += cross;
    cx += (lng1 + lng2) * cross;
    cy += (lat1 + lat2) * cross;
  }

  area = area / 2;

  // Dejenere durum (tüm noktalar tek bir doğru üzerinde, alan ~0): şoelace formülü
  // 0'a bölme yapar — bu durumda basit vertex ortalamasına düşüyoruz (hâlâ makul bir yaklaşım).
  if (Math.abs(area) < 1e-12) {
    const avgLat = coords.reduce((s, [lat]) => s + lat, 0) / coords.length;
    const avgLng = coords.reduce((s, [, lng]) => s + lng, 0) / coords.length;
    return [avgLat, avgLng];
  }

  cx = cx / (6 * area);
  cy = cy / (6 * area);
  return [cy, cx]; // [lat, lng]
}
