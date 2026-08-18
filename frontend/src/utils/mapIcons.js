import L from "leaflet";

// Leaflet'in varsayılan PNG ikonları Vite/webpack gibi bundler'larla paketlenince
// yol çözümü kırılıyor (bilinen bir Leaflet sorunu) ve pin görünmez oluyor.
// Bunun yerine bağımlılıksız, inline SVG tabanlı pin ikonları kullanıyoruz.
//
// Cihaz türüne göre farklı semboller: pin'in içindeki glif (damla, ampul, bank vb.)
// ekipman türünü, pin'in ve glifin rengi (yeşil/kırmızı) ise durumu gösterir —
// böylece "hangi tür ekipman" ve "çalışıyor mu/arızalı mı" bilgisi TEK bakışta,
// birbirinden bağımsız iki katmanda okunabiliyor.

const GLYPHS = {
  // Sulama cihazı: damla
  SULAMA_CIHAZI: (c) => `<path d="M15 8.5c-2.6 3.1-4.2 5.5-4.2 7.6a4.2 4.2 0 0 0 8.4 0c0-2.1-1.6-4.5-4.2-7.6z" fill="${c}"/>`,

  // Aydınlatma: güneş/ampul
  AYDINLATMA: (c) => `
    <circle cx="15" cy="15" r="2.6" fill="${c}"/>
    <g stroke="${c}" stroke-width="1.4" stroke-linecap="round">
      <line x1="15" y1="9" x2="15" y2="10.6"/>
      <line x1="15" y1="19.4" x2="15" y2="21"/>
      <line x1="9" y1="15" x2="10.6" y2="15"/>
      <line x1="19.4" y1="15" x2="21" y2="15"/>
      <line x1="10.8" y1="10.8" x2="11.9" y2="11.9"/>
      <line x1="18.1" y1="18.1" x2="19.2" y2="19.2"/>
      <line x1="19.2" y1="10.8" x2="18.1" y2="11.9"/>
      <line x1="11.9" y1="18.1" x2="10.8" y2="19.2"/>
    </g>`,

  // Bank: oturma yüzeyi + iki ayak
  BANK: (c) => `
    <g stroke="${c}" stroke-width="1.6" stroke-linecap="round">
      <line x1="9" y1="14" x2="21" y2="14"/>
      <line x1="9" y1="18" x2="21" y2="18"/>
      <line x1="10.5" y1="14" x2="10.5" y2="21"/>
      <line x1="19.5" y1="14" x2="19.5" y2="21"/>
    </g>`,

  // Çöp kutusu
  COP_KUTUSU: (c) => `
    <g stroke="${c}" stroke-width="1.6" stroke-linecap="round" fill="none">
      <rect x="11" y="12" width="8" height="10" rx="1"/>
      <line x1="9" y1="12" x2="21" y2="12"/>
      <line x1="13" y1="9" x2="17" y2="9"/>
      <line x1="13" y1="9" x2="13" y2="12"/>
      <line x1="17" y1="9" x2="17" y2="12"/>
    </g>`,

  // Oyun grubu: yıldız
  OYUN_GRUBU: (c) => `<path d="M15 8.5l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="${c}"/>`,

  // Kamera
  KAMERA: (c) => `
    <g stroke="${c}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9.5" y="12.5" width="11" height="8" rx="1.4"/>
      <circle cx="15" cy="16.5" r="2.4"/>
      <rect x="12.5" y="10" width="5" height="2.5" rx="0.6"/>
    </g>`,

  // Diğer / bilinmeyen tür: nötr daire
  DIGER: (c) => `<circle cx="15" cy="15" r="3" fill="none" stroke="${c}" stroke-width="1.6"/>`,
};

function glyphFor(assetType) {
  return GLYPHS[assetType] || GLYPHS.DIGER;
}

// Pin gövdesi (teardrop) + beyaz zemin dairesi + türe özgü glif. Glif VE pin gövdesi
// aynı renkte (yeşil/kırmızı) — durum bilgisi kaybolmasın diye.
function pinWithGlyphSvg(color, assetType) {
  return `
    <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="10.5" fill="#ffffff"/>
      ${glyphFor(assetType)(color)}
    </svg>`;
}

function createSymbolIcon(color, assetType) {
  return L.divIcon({
    className: "map-pin-icon",
    html: pinWithGlyphSvg(color, assetType),
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
}

const WORKING_COLOR = "#1f8a55";
const FAULTY_COLOR = "#c1352a";

// Basit renkli pin (glifsiz) — sade tek-renk pin gereken yerler için (ör. konum seçici).
function pinSvg(color) {
  return `
    <svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.8 0 0 5.8 0 13c0 9.3 13 25 13 25s13-15.7 13-25C26 5.8 20.2 0 13 0z" fill="${color}"/>
      <circle cx="13" cy="13" r="5" fill="#ffffff"/>
    </svg>`;
}
function createPinIcon(color) {
  return L.divIcon({
    className: "map-pin-icon",
    html: pinSvg(color),
    iconSize: [26, 38],
    iconAnchor: [13, 38],
    popupAnchor: [0, -34],
  });
}

// Konum seçici (cihaz ekleme) haritasında kullanılan mavi pin (tür henüz belli değil)
export const bluePinIcon = createPinIcon("#0b5fa5");

// Geriye dönük uyumluluk için düz yeşil/kırmızı pinler (glifsiz) hâlâ dışa açık.
export const greenPinIcon = createPinIcon(WORKING_COLOR);
export const redPinIcon = createPinIcon(FAULTY_COLOR);

// Büyük harita sayfasında asıl kullanılan: cihaz türüne göre sembol + duruma göre renk.
const iconCache = new Map();
export function deviceSymbolIcon(assetType, status) {
  const key = assetType + "|" + status;
  if (!iconCache.has(key)) {
    const color = status === "FAULTY" ? FAULTY_COLOR : WORKING_COLOR;
    iconCache.set(key, createSymbolIcon(color, assetType));
  }
  return iconCache.get(key);
}

// --- Vatandaş haritası: park pini ---
// Bilinçli olarak cihaz pinlerinden (yeşil/kırmızı teardrop + tür glifi) VE konum
// seçici pininden (düz mavi) görsel olarak AYRIŞIYOR: farklı bir renk (orman yeşili,
// "çalışıyor" durumunu ifade eden başarı yeşilinden farklı bir ton), ağaç/yaprak
// glifi, ve biraz daha büyük gövde — haritada "bu bir park" mesajı ilk bakışta net
// olsun, cihaz durumuyla karıştırılmasın diye.
const PARK_COLOR = "#2f7d5c";

function parkPinSvg() {
  return `
    <svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 11.9 17 29 17 29s17-17.1 17-29C34 7.6 26.4 0 17 0z" fill="${PARK_COLOR}"/>
      <circle cx="17" cy="17" r="12" fill="#ffffff"/>
      <g fill="${PARK_COLOR}">
        <circle cx="17" cy="12.5" r="5.2"/>
        <circle cx="12.2" cy="16.5" r="4.2"/>
        <circle cx="21.8" cy="16.5" r="4.2"/>
        <rect x="15.7" y="17.5" width="2.6" height="7" rx="1"/>
      </g>
    </svg>`;
}

export const parkPinIcon = L.divIcon({
  className: "map-pin-icon",
  html: parkPinSvg(),
  iconSize: [34, 46],
  iconAnchor: [17, 46],
  popupAnchor: [0, -42],
});
