import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Section from "../components/common/Section";
import PageHeader from "../components/common/PageHeader";
import Alert from "../components/common/Alert";
import Loading from "../components/common/Loading";
import StatusBadge from "../components/common/StatusBadge";
import AssetTypeBadge from "../components/common/AssetTypeBadge";
import FaultAgeBadge from "../components/common/FaultAgeBadge";
import { getDevice } from "../api/devices";
import { deviceDisplayName } from "../utils/deviceDisplay";
import { regionDisplayName } from "../utils/regionDisplay";
import { formatDateTime } from "../utils/format";
import { durationSince } from "../utils/durationSince";

// Modal/panel yerine kalıcı, paylaşılabilir bir URL (/cihazlar/:id). Sadece mevcut
// backend verisini (GET /api/devices/device-info/{id}) gösterir, fake veri yok.
export default function DeviceDetailPage() {
  const { id } = useParams();
  const [device, setDevice] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setDevice(null);
    setError("");
    getDevice(id)
      .then(setDevice)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <Section title="Cihaz Bulunamadı">
        <Alert type="error">{error}</Alert>
        <Link to="/cihazlar" style={{ color: "var(--color-primary)", fontSize: 13.5 }}>
          ← Cihazlar listesine dön
        </Link>
      </Section>
    );
  }

  if (!device) return <Loading label="Cihaz bilgileri yükleniyor..." />;

  return (
    <>
      <div style={{ marginBottom: "var(--space-3)" }}>
        <Link to="/cihazlar" style={{ color: "var(--color-primary)", fontSize: 13.5, fontWeight: 600 }}>
          ← Cihazlar listesine dön
        </Link>
      </div>

      <PageHeader
        title={deviceDisplayName(device)}
        subtitle={`Cihaz ID: #${device.id}`}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <AssetTypeBadge type={device.assetType} />
            <StatusBadge status={device.status} />
            {device.status === "FAULTY" && <FaultAgeBadge since={device.statusChangedAt} />}
          </div>
        }
      />

      <Section title="Ekipman Bilgileri">
        <div className="stat-grid">
          <DetailRow label="Park" value={device.region ? regionDisplayName(device.region) : "—"} />
          <DetailRow label="Ekipman No" value={`#${device.deviceNo}`} />
          <DetailRow label="Sorumlu Personel Yetkilisi" value={device.region?.headGardenerUsername || "Atanmadı"} />
        </div>
      </Section>

      {device.status === "FAULTY" && (
        <Section title="Arıza Bilgisi">
          <div className="stat-grid">
            <DetailRow label="Arıza Türü" value={device.faultType || "Belirtilmemiş"} />
            <DetailRow label="Açıklama" value={device.description || "—"} />
            <DetailRow
              label="Açık Süresi"
              value={durationSince(device.statusChangedAt) || "—"}
              tone="danger"
            />
            <DetailRow label="İlgili Personel" value={device.lastUpdatedBy || "Kayıtlı değil"} />
          </div>

          {device.photoBase64 && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>
                Arıza Fotoğrafı
              </p>
              <img
                src={device.photoBase64}
                alt="Arıza fotoğrafı"
                style={{
                  maxWidth: "100%",
                  maxHeight: 360,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                  cursor: "zoom-in",
                }}
                onClick={() => window.open(device.photoBase64, "_blank")}
              />
            </div>
          )}
        </Section>
      )}

      <Section title="Zaman Bilgileri">
        <div className="stat-grid">
          <DetailRow label="Oluşturulma Tarihi" value={formatDateTime(device.createdAt)} />
          <DetailRow label="Son Güncelleme" value={formatDateTime(device.statusChangedAt)} />
        </div>
      </Section>

      {(device.latitude != null || device.longitude != null) && (
        <Section title="Konum">
          <div className="stat-grid">
            <DetailRow label="Enlem" value={device.latitude ?? "—"} />
            <DetailRow label="Boylam" value={device.longitude ?? "—"} />
          </div>
          <Link to="/harita" style={{ color: "var(--color-primary)", fontSize: 13.5, display: "inline-block", marginTop: "var(--space-3)" }}>
            Haritada görüntüle →
          </Link>
        </Section>
      )}
    </>
  );
}

function DetailRow({ label, value, tone }) {
  return (
    <div
      style={{
        padding: "var(--space-4)",
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        borderLeft: `3px solid ${tone === "danger" ? "var(--color-danger)" : "var(--color-border-strong)"}`,
      }}
    >
      <div
        style={{
          fontSize: 14.5,
          fontWeight: 700,
          color: tone === "danger" ? "var(--color-danger)" : "var(--color-text)",
        }}
      >
        {value ?? "—"}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", marginTop: 4 }}>{label}</div>
    </div>
  );
}
