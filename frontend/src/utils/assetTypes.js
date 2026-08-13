// Backend enum'uyla birebir eşleşir: com.belediye.bitkisulama.enums.AssetType
export const ASSET_TYPES = {
  SULAMA_CIHAZI: "SULAMA_CIHAZI",
  AYDINLATMA: "AYDINLATMA",
  BANK: "BANK",
  COP_KUTUSU: "COP_KUTUSU",
  OYUN_GRUBU: "OYUN_GRUBU",
  KAMERA: "KAMERA",
  DIGER: "DIGER",
};

export const ASSET_TYPE_LABELS = {
  SULAMA_CIHAZI: "Sulama Cihazı",
  AYDINLATMA: "Aydınlatma",
  BANK: "Bank",
  COP_KUTUSU: "Çöp Kutusu",
  OYUN_GRUBU: "Oyun Grubu",
  KAMERA: "Kamera",
  DIGER: "Diğer",
};

export function assetTypeLabel(type) {
  return ASSET_TYPE_LABELS[type] || type || "—";
}
