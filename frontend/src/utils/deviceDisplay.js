import { assetTypeLabel } from "./assetTypes";

// Cihazın ayrı bir "ad" alanı yok (backend'de sadece deviceNo var) — fake bir isim
// uydurmak yerine, mevcut gerçek alanlardan (tür + numara) okunabilir bir başlık türetiyoruz.
// Örn: "Sulama Cihazı #4", "Aydınlatma #12"
export function deviceDisplayName(device) {
  if (!device) return "";
  return `${assetTypeLabel(device.assetType)} #${device.deviceNo}`;
}
