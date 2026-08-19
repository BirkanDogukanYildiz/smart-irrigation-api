import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Section from "../../components/common/Section";
import StatItem from "../../components/common/StatItem";
import Loading from "../../components/common/Loading";
import Alert from "../../components/common/Alert";
import { getPublicSummary } from "../../api/public";
import { assetTypeLabel } from "../../utils/assetTypes";
import { regionDisplayName } from "../../utils/regionDisplay";

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
      {/* --- Karşılama şeridi: kurumsal, sade — büyük fotoğraf/gradient yok, sadece
          accent renginin ince bir dokunuşu ve net bir mesaj. --- */}
      <div
        style={{
          background: "linear-gradient(180deg, var(--color-primary-light), var(--color-surface))",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6) var(--space-5)",
          marginBottom: "var(--space-5)",
        }}
      >
        <h2 className="page-title">Park ve Bahçeler Vatandaş Portalı</h2>
        <p className="page-subtitle" style={{ maxWidth: 560 }}>
          İstanbul genelindeki parklardaki sulama, aydınlatma ve diğer ekipmanların güncel durumunu görüntüleyin;
          bir sorun fark ettiğinizde birkaç adımda talep oluşturun.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-5)", flexWrap: "wrap" }}>
          <Link to="/vatandas/parklar" className="btn btn-primary btn-md">
            Parkları Görüntüle
          </Link>
          <Link to="/vatandas/talep-olustur" className="btn btn-secondary btn-md">
            Talep Oluştur
          </Link>
        </div>
      </div>

      {error && <Alert type="error">Veriler şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.</Alert>}
      {!summary && !error && <Loading label="Yükleniyor..." />}

      {summary && (
        <Section title="Genel Durum" subtitle="Sistemdeki park/bahçe ekipmanlarının anlık, herkese açık özeti.">
          <div className="stat-grid">
            <StatItem label="Toplam Ekipman" value={summary.totalAssets} tone="primary" />
            <StatItem label="Çalışır Durumda" value={summary.workingCount} tone="success" />
            <StatItem label="Arızalı" value={summary.faultyCount} tone="danger" />
            <StatItem label="Park Alanı Sayısı" value={summary.totalRegions} />
          </div>
          <p style={{ marginTop: "var(--space-5)", fontSize: 13.5 }}>
            Şu anda <strong>{summary.totalRegions}</strong> park/bahçe alanındaki{" "}
            <strong>{summary.totalAssets}</strong> ekipmanın <strong>%{summary.workingRatioPercent}</strong>'i
            çalışır durumda.
          </p>
        </Section>
      )}

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
          title="Park Alanları"
          subtitle="Konumlarını haritada görmek için Parklar sekmesine geçebilirsiniz."
          actions={
            <Link to="/vatandas/parklar" className="btn btn-secondary btn-sm">
              Parklar →
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
                <span>{regionDisplayName(r)}</span>
                <strong>{r.assetCount} ekipman</strong>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
