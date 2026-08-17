import { durationSince } from "../../utils/durationSince";

// Arızanın ne kadar süredir açık olduğunu gösteren rozet. Cihaz listesi, harita pin
// popup'ı (bkz. DeviceMap.jsx, kendi HTML string'i içinde ayrıca kullanılıyor) ve
// arıza detay raporunda (FaultReportModal.jsx) kullanılır.
export default function FaultAgeBadge({ since }) {
  const label = durationSince(since);
  if (!label) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 999,
        color: "var(--color-danger)",
        background: "var(--color-danger-bg)",
        whiteSpace: "nowrap",
      }}
      title="Arızanın açık olduğu süre"
    >
      {label}
    </span>
  );
}
