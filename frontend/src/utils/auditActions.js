// Backend'deki AuditActions sabitleriyle birebir eşleşir. Sadece görsel kategori/renk
// eşlemesi için — backend'den gelen "action" metnini olduğu gibi gösteriyoruz, burada
// yeniden adlandırmıyoruz.
const ACTION_TONES = {
  "Giriş yapıldı": "info",
  "Çıkış yapıldı": "muted",

  "Cihaz oluşturuldu": "success",
  "Cihaz güncellendi": "info",
  "Cihaz silindi": "danger",
  "Cihaz konumu güncellendi": "info",

  "Arıza oluşturuldu": "danger",
  "Arıza güncellendi": "warning",
  "Arıza kapatıldı": "success",

  "Bölge oluşturuldu": "success",
  "Bölge güncellendi": "info",
  "Bölge silindi": "danger",

  "Kullanıcı oluşturuldu": "success",
  "Kullanıcı güncellendi": "info",
  "Kullanıcı silindi": "danger",
};

const TONE_COLORS = {
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success)" },
  danger: { bg: "var(--color-danger-bg)", fg: "var(--color-danger)" },
  warning: { bg: "#fdf1da", fg: "#8a5a06" },
  info: { bg: "var(--color-primary-light)", fg: "var(--color-primary-dark)" },
  muted: { bg: "var(--color-primary-lighter)", fg: "var(--color-text-muted)" },
};

export function actionTone(action) {
  return ACTION_TONES[action] || "muted";
}

export function actionColors(action) {
  return TONE_COLORS[actionTone(action)];
}

// Kaynak türü -> okunabilir Türkçe etiket (backend'deki KAYNAK_* sabitleriyle eşleşir)
const RESOURCE_LABELS = {
  AUTH: "Kimlik Doğrulama",
  CIHAZ: "Cihaz",
  BOLGE: "Bölge",
  KULLANICI: "Kullanıcı",
};

export function resourceLabel(resourceType) {
  return RESOURCE_LABELS[resourceType] || resourceType || "—";
}
