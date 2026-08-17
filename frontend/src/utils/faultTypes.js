// Arıza bildirirken seçilebilecek yaygın arıza türleri. Backend'de faultType alanı
// serbest bir String olduğundan (bkz. SprinklerInfo entity) burada sabit bir enum
// ZORUNLU değil — sadece kullanıcıya hızlı seçim sunmak için bir öneri listesi.
// "Diğer" seçilirse kullanıcı kendi metnini girebilir (bkz. ReportFaultModal).
export const FAULT_TYPES = [
  "Vana Arızası",
  "Boru Patlağı / Sızıntı",
  "Elektrik Kesintisi",
  "Sensör Arızası",
  "Tıkanıklık",
  "Fiziksel Hasar / Kırılma",
  "Yazılım/Bağlantı Hatası",
  "Diğer",
];

export const OTHER_FAULT_TYPE = "Diğer";
