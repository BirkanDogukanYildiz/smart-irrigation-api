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

export const REQUEST_STATUS = {
  YENI: "YENI",
  INCELENDI: "INCELENDI",
};

export const REQUEST_STATUS_LABELS = {
  YENI: "Yeni",
  INCELENDI: "İncelendi",
};

export function requestStatusLabel(status) {
  return REQUEST_STATUS_LABELS[status] || status;
}
