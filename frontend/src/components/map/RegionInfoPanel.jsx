import { Link } from "react-router-dom";
import { zoneColorForRegion } from "../../utils/zoneColors";

// Haritadaki bir zone'a (bölge sınırına) tıklanınca açılan bilgi paneli.
// Cihaz sayıları, MapPage'in zaten yüklü olan `devices` listesinden anlık
// hesaplanıyor — backend'e ek bir istek atmıyoruz, fake veri de yok.
export default function RegionInfoPanel({ region, devices, onClose, onFlyTo }) {
  if (!region) return null;

  const regionDevices = devices.filter((d) => d.region?.id === region.id);
  const workingCount = regionDevices.filter((d) => d.status === "WORKING").length;
  const faultyCount = regionDevices.filter((d) => d.status === "FAULTY").length;
  const color = zoneColorForRegion(region.id);

  return (
    <div
      style={{
        border: `1px solid ${color}`,
        borderLeft: `4px solid ${color}`,
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        padding: "var(--space-4)",
        marginBottom: "var(--space-3)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <h3 style={{ margin: 0 }}>{region.regionName}</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--color-text-muted)" }}>
            {region.districtName} · Bölge No: {region.regionNo} · Bölge ID: {region.id}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Kapat"
          style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      <div
        className="stat-grid"
        style={{ marginTop: "var(--space-3)", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))" }}
      >
        <MiniStat label="Toplam Ekipman" value={regionDevices.length} />
        <MiniStat label="Çalışıyor" value={workingCount} color="var(--color-success)" />
        <MiniStat label="Arızalı" value={faultyCount} color="var(--color-danger)" />
        <MiniStat label="Sorumlu Personel" value={region.headGardenerUsername || "Atanmadı"} isText />
      </div>

      <p className="hint" style={{ marginTop: "var(--space-2)", marginBottom: 0 }}>
        Not: Sistem şu an sulamayı otomatik tetiklemediği/izlemediği için "son sulama zamanı" bu panelde
        gösterilmiyor — bu veri henüz backend'de tutulmuyor.
      </p>

      <Link
        to={`/bolgeler/${region.id}`}
        style={{
          display: "inline-block",
          marginTop: "var(--space-2)",
          color: "var(--color-primary)",
          fontSize: 12.5,
          fontWeight: 600,
        }}
      >
        Bölgenin tam detay sayfasını gör →
      </Link>

      {region.boundary == null && (
        <button
          onClick={() => onFlyTo(region)}
          style={{
            marginTop: "var(--space-2)",
            background: "none",
            border: "none",
            color: "var(--color-primary)",
            fontSize: 12.5,
            cursor: "pointer",
            padding: 0,
          }}
        >
          Bu bölgenin haritada çizili bir sınırı yok — cihazlarının bulunduğu konuma git
        </button>
      )}
    </div>
  );
}

function MiniStat({ label, value, color, isText }) {
  return (
    <div style={{ paddingLeft: 10, borderLeft: `3px solid ${color || "var(--color-border)"}` }}>
      <div style={{ fontSize: isText ? 14 : 20, fontWeight: 700, color: color || "var(--color-text)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}
