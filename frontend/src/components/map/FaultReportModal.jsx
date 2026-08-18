import { deviceDisplayName } from "../../utils/deviceDisplay";
import { regionDisplayName } from "../../utils/regionDisplay";
import { formatDateTime } from "../../utils/format";
import { durationSince } from "../../utils/durationSince";
import Button from "../common/Button";

// "Arıza Raporunu Görüntüle" butonuna basılınca açılan, öne çıkan (modal) rapor görünümü.
// Sadece mevcut backend verisini (SprinklerInfoResponseDto) gösterir, fake veri yok.
export default function FaultReportModal({ device, onClose }) {
  if (!device) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 32, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          maxWidth: 460,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            padding: "var(--space-5)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h3 style={{ margin: 0, color: "var(--color-danger)" }}>Arıza Raporu</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
              {deviceDisplayName(device)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Kapat"
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "var(--space-5)" }}>
          <ReportRow label="Arıza Türü" value={device.faultType || "Belirtilmemiş"} />
          <ReportRow label="Açıklama" value={device.description || "—"} />
          <ReportRow label="Cihaz" value={deviceDisplayName(device)} />
          <ReportRow label="Cihaz ID" value={`#${device.id}`} />
          <ReportRow label="Park" value={device.region ? regionDisplayName(device.region) : "—"} />
          <ReportRow label="Durum" value="Arızalı" valueColor="var(--color-danger)" />
          <ReportRow
            label="Açık Süresi"
            value={durationSince(device.statusChangedAt) || "—"}
            valueColor="var(--color-danger)"
          />
          <ReportRow label="Oluşturulma Tarihi" value={formatDateTime(device.createdAt)} />
          <ReportRow label="Son Güncelleme" value={formatDateTime(device.statusChangedAt)} />
          <ReportRow label="İlgili Personel" value={device.lastUpdatedBy || "Kayıtlı değil"} last={!device.photoBase64} />

          {device.photoBase64 && (
            <div style={{ marginTop: "var(--space-3)" }}>
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>
                Arıza Fotoğrafı
              </p>
              <img
                src={device.photoBase64}
                alt="Arıza fotoğrafı"
                style={{
                  width: "100%",
                  maxHeight: 280,
                  objectFit: "cover",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  cursor: "zoom-in",
                }}
                onClick={() => window.open(device.photoBase64, "_blank")}
              />
            </div>
          )}
        </div>

        <div style={{ padding: "0 var(--space-5) var(--space-5)" }}>
          <Button variant="secondary" onClick={onClose} style={{ width: "100%" }}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReportRow({ label, value, valueColor, last }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        borderBottom: last ? "none" : "1px solid var(--color-border)",
        fontSize: 13.5,
      }}
    >
      <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <strong style={{ color: valueColor || "var(--color-text)", textAlign: "right" }}>{value}</strong>
    </div>
  );
}
