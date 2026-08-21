import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Loading from "../components/common/Loading";
import Alert from "../components/common/Alert";
import Icon from "../components/common/Icon";
import { getDashboardSummary } from "../api/dashboard";
import { ASSET_TYPES, assetTypeLabel } from "../utils/assetTypes";

const TYPE_ICONS = {
  SULAMA_CIHAZI: "droplet",
  AYDINLATMA: "lightbulb",
  BANK: "bench",
  COP_KUTUSU: "trash",
  OYUN_GRUBU: "playground",
  KAMERA: "camera",
  DIGER: "box",
};

// "Kategoriler": ekipman TÜRLERİNE göre bir bakış — yeni bir veri modeli/API
// YOK, mevcut dashboard özetindeki assetTypeBreakdown'ı yeniden kullanıyor
// (bkz. DashboardController). Bir kategoriye tıklamak, Harita ve Cihazlar
// sayfasına o türe önceden filtrelenmiş şekilde götürür (aynı sayfa, aynı state).
export default function CategoriesPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageHeader title="Kategoriler" subtitle="Ekipman türlerine göre genel bakış." />

      {error && <Alert type="error">{error}</Alert>}
      {!summary && !error && <Loading label="Yükleniyor..." />}

      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {Object.values(ASSET_TYPES).map((type) => {
            const count = summary.assetTypeBreakdown?.[type] || 0;
            return (
              <button
                key={type}
                onClick={() => navigate(`/harita?tur=${type}`)}
                style={{
                  textAlign: "left",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-sm)",
                  padding: "var(--space-5)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  transition: "border-color 0.12s ease, transform 0.12s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={TYPE_ICONS[type] || "box"} size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text)" }}>{count}</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 600 }}>
                    {assetTypeLabel(type)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
