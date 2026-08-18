import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import Loading from "../components/common/Loading";
import DeviceTable from "../components/devices/DeviceTable";
import { getRegion } from "../api/regions";
import { listDevices } from "../api/devices";
import { regionDisplayName } from "../utils/regionDisplay";

// Modal/panel yerine kalıcı, paylaşılabilir bir URL (/bolgeler/:id). Sadece mevcut
// backend verisini kullanır (GET /api/region/{id} + GET /api/devices/list filtrelenmiş).
export default function RegionDetailPage() {
  const { id } = useParams();
  const [region, setRegion] = useState(null);
  const [devices, setDevices] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setRegion(null);
    setDevices(null);
    setError("");
    getRegion(id)
      .then(setRegion)
      .catch((e) => setError(e.message));
    listDevices()
      .then((all) => setDevices(all.filter((d) => d.region?.id === Number(id))))
      .catch(() => {
        // Cihaz listesi yüklenemezse bölge bilgisi yine de gösterilir.
      });
  }, [id]);

  if (error) {
    return (
      <Section title="Bölge Bulunamadı">
        <Alert type="error">{error}</Alert>
        <Link to="/bolgeler" style={{ color: "var(--color-primary)", fontSize: 13.5 }}>
          ← Bölgeler listesine dön
        </Link>
      </Section>
    );
  }

  if (!region) return <Loading label="Bölge bilgileri yükleniyor..." />;

  const workingCount = devices?.filter((d) => d.status === "WORKING").length ?? null;
  const faultyCount = devices?.filter((d) => d.status === "FAULTY").length ?? null;

  return (
    <>
      <div style={{ marginBottom: "var(--space-3)" }}>
        <Link to="/bolgeler" style={{ color: "var(--color-primary)", fontSize: 13.5 }}>
          ← Bölgeler listesine dön
        </Link>
      </div>

      <Section title={regionDisplayName(region)} subtitle={`Bölge No: ${region.regionNo} · Bölge ID: #${region.id}`}>
        <div className="stat-grid">
          <DetailRow label="İlçe" value={region.districtName} />
          <DetailRow label="Park Adı" value={region.regionName} />
          <DetailRow label="Sulama Alanı" value={region.irrigationAreaName} />
          <DetailRow label="Sorumlu Personel Yetkilisi" value={region.headGardenerUsername || "Atanmadı"} />
          <DetailRow label="Açıklama" value={region.description || "—"} />
        </div>
      </Section>

      <Section title="Ekipman Özeti">
        <div className="stat-grid">
          <DetailRow label="Toplam Ekipman" value={devices?.length ?? "—"} />
          <DetailRow label="Çalışıyor" value={workingCount ?? "—"} tone="success" />
          <DetailRow label="Arızalı" value={faultyCount ?? "—"} tone="danger" />
        </div>
      </Section>

      <Section title="Bölgedeki Ekipmanlar">
        <DeviceTable devices={devices} readOnly />
      </Section>

      <Link to="/harita" style={{ color: "var(--color-primary)", fontSize: 13.5 }}>
        Haritada görüntüle →
      </Link>
    </>
  );
}

function DetailRow({ label, value, tone }) {
  return (
    <div style={{ paddingLeft: "var(--space-4)", borderLeft: `3px solid var(--color-border)` }}>
      <div
        style={{
          fontSize: 14.5,
          fontWeight: 700,
          color: tone === "danger" ? "var(--color-danger)" : tone === "success" ? "var(--color-success)" : "var(--color-text)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}
