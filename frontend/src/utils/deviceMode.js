// Backend enum'uyla birebir eşleşir: com.belediye.parksystems.enums.DeviceMode.
// Status'tan (WORKING/FAULTY, arıza) BAĞIMSIZ, ayrı bir alan — bkz. backend
// SprinklerInfo.mode üzerindeki not.
export const DEVICE_MODES = {
  NORMAL: "NORMAL",
  BAKIMDA: "BAKIMDA",
  PASIF: "PASIF",
};

export const DEVICE_MODE_LABELS = {
  NORMAL: "Normal",
  BAKIMDA: "Bakımda",
  PASIF: "Pasif",
};

export function deviceModeLabel(mode) {
  return DEVICE_MODE_LABELS[mode] || mode;
}
