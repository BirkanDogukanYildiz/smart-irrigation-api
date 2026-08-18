import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Section from "../../components/common/Section";
import StatItem from "../../components/common/StatItem";
import Loading from "../../components/common/Loading";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import { getPublicSummary } from "../../api/public";
import { assetTypeLabel } from "../../utils/assetTypes";

// Vatandaş "Ana Sayfa"sı: sadece genel durum özeti (kimlik doğrulama gerektirmez).
// Eskiden tek bir sayfada özet + talep formu birlikteydi; artık her biri kendi
// amacına odaklanan ayrı bir sekme (bkz. App.jsx, CitizenLayout).
export default function CitizenDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicSummary()
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <Section
        title="Genel Durum"
        subtitle="Sistemdeki park/bahçe ekipmanlarının anlık, herkese açık özeti."
        actions={
          <Link to="/vatandas/talep-olustur">
            <Button variant="primary" size="sm">
              Talep Oluştur
            </Button>
          </Link>
        }
      >
        {error && <Alert type="error">Veriler şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.</Alert>}
        {!summary && !error && <Loading label="Yükleniyor..." />}

        {summary && (
          <>
            <p style={{ marginBottom: "var(--space-5)", fontSize: 15, color: "var(--color-text)" }}>
              Şu anda <strong>{summary.totalRegions}</strong> park/bahçe alanında{" "}
              <strong>{summary.totalAssets}</strong> ekipman izleniyor, bunların{" "}
              <strong>%{summary.workingRatioPercent}</strong>'i çalışır durumda.
            </p>

            <div className="stat-grid">
              <StatItem label="Toplam Ekipman" value={summary.totalAssets} tone="primary" />
              <StatItem label="Çalışır Durumda" value={summary.workingCount} tone="success" />
              <StatItem label="Arızalı" value={summary.faultyCount} tone="danger" />
              <StatItem label="Bölge Sayısı" value={summary.totalRegions} />
            </div>
          </>
        )}
      </Section>

      {summary?.assetTypeBreakdown && Object.keys(summary.assetTypeBreakdown).length > 0 && (
        <Section title="Ekipman Türüne Göre Dağılım">
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {Object.entries(summary.assetTypeBreakdown).map(([type, count]) => (
              <li
                key={type}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: 13.5,
                }}
              >
                <span>{assetTypeLabel(type)}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {summary?.regions && summary.regions.length > 0 && (
        <Section
          title="Bölgeler"
          subtitle="Park alanlarını haritada görmek için Parklar sekmesine geçebilirsiniz."
          actions={
            <Link to="/vatandas/parklar">
              <Button variant="secondary" size="sm">
                Parklar →
              </Button>
            </Link>
          }
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {summary.regions.map((r, idx) => (
              <li
                key={`${r.regionName}-${idx}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: 13.5,
                }}
              >
                <span>
                  {r.regionName} <span style={{ color: "var(--color-text-faint)" }}>({r.districtName})</span>
                </span>
                <strong>{r.assetCount} ekipman</strong>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
