// Backend enum'larıyla birebir eşleşir: com.belediye.parksystems.enums.RequestTopic / RequestStatus
export const REQUEST_TOPICS = {
  ARIZA_BILDIRIMI: "ARIZA_BILDIRIMI",
  BAKIM_TALEBI: "BAKIM_TALEBI",
  TEMIZLIK: "TEMIZLIK",
  GUVENLIK: "GUVENLIK",
  ONERI: "ONERI",
  SIKAYET: "SIKAYET",
  DIGER: "DIGER",
};

export const REQUEST_TOPIC_LABELS = {
  ARIZA_BILDIRIMI: "Arıza Bildirimi",
  BAKIM_TALEBI: "Bakım Talebi",
  TEMIZLIK: "Temizlik",
  GUVENLIK: "Güvenlik",
  ONERI: "Öneri",
  SIKAYET: "Şikayet",
  DIGER: "Diğer",
};

export function requestTopicLabel(topic) {
  return REQUEST_TOPIC_LABELS[topic] || topic;
}

// DİKKAT — GERİYE DÖNÜK UYUMLULUK: backend'deki YENI sabit ismi (enum constant)
// DEĞİŞTİRİLMEDİ (eski kayıtlarla uyumluluk için, bkz. backend RequestStatus.java),
// sadece burada görünen ETİKETİ "İncelenmedi" oldu. Yeni INCELENIYOR durumu arada
// eklendi. Üç durum arasında iki yönlü geçiş mümkün (bkz. RequestTable.jsx).
export const REQUEST_STATUS = {
  YENI: "YENI",
  INCELENIYOR: "INCELENIYOR",
  INCELENDI: "INCELENDI",
};

export const REQUEST_STATUS_LABELS = {
  YENI: "İncelenmedi",
  INCELENIYOR: "İnceleniyor",
  INCELENDI: "İncelendi",
};

// Durum akışındaki sıralama — sadece varsayılan "ileri" öneri butonunu belirlemek
// için kullanılıyor (bkz. RequestTable.jsx). Geçişler bununla SINIRLI DEĞİL: iki
// yönlü serbest geçiş her zaman mümkün, backend hiçbir sıralama kısıtı uygulamıyor.
export const REQUEST_STATUS_ORDER = [REQUEST_STATUS.YENI, REQUEST_STATUS.INCELENIYOR, REQUEST_STATUS.INCELENDI];

export function requestStatusLabel(status) {
  return REQUEST_STATUS_LABELS[status] || status;
}
