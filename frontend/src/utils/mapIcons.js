import L from "leaflet";

// Leaflet'in varsayılan PNG ikonları Vite/webpack gibi bundler'larla paketlenince
// yol çözümü kırılıyor (bilinen bir Leaflet sorunu) ve pin görünmez oluyor.
// Bunun yerine bağımlılıksız, inline SVG tabanlı pin ikonları kullanıyoruz.
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

// Konum seçici (cihaz ekleme) haritasında kullanılan mavi pin
export const bluePinIcon = createPinIcon("#0b5fa5");

// Büyük harita sayfasında cihaz durumuna göre kullanılan pinler
export const greenPinIcon = createPinIcon("#1f8a55");
export const redPinIcon = createPinIcon("#c1352a");
