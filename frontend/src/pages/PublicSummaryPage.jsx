import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import IBBLogo from "../components/common/IBBLogo";
import StatItem from "../components/common/StatItem";
import ThemeToggle from "../components/common/ThemeToggle";
import { getPublicSummary } from "../api/public";
import { assetTypeLabel } from "../utils/assetTypes";
import "../styles/form.css";
import "../styles/login.css";

// Faz 6-A: Kimlik doğrulama GEREKTİRMEYEN, vatandaşa açık şeffaflık sayfası.
// /giris sayfasındaki mevcut marka diliyle (login-page/login-card) uyumlu,
// mobilde de login sayfası gibi tek sütun ve ortalanmış olduğu için ek bir
// medya sorgusuna gerek kalmadan responsive çalışır.
export default function PublicSummaryPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicSummary()
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="login-page">
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="login-card" style={{ maxWidth: 560 }}>
        <div className="login-brand">
          <IBBLogo size={40} />
          <h1>Park Takip Sistemi — Vatandaş Görünümü</h1>
          <div className="login-sub">İstanbul Büyükşehir Belediyesi · Park ve Bahçeler</div>
        </div>

        <div className="login-body">
          {error && (
            <p style={{ color: "var(--color-danger)", marginBottom: 16 }}>
              Veriler şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.
            </p>
          )}

          {!summary && !error && <p>Yükleniyor...</p>}

          {summary && (
            <>
              <p style={{ marginBottom: "var(--space-5)", fontSize: 15, color: "var(--color-text)" }}>
                Şu anda <strong>{summary.totalRegions}</strong> park/bahçe alanında{" "}
                <strong>{summary.totalAssets}</strong> ekipman izleniyor, bunların{" "}
                <strong>%{summary.workingRatioPercent}</strong>'i çalışır durumda.
              </p>

              <div className="stat-grid" style={{ marginBottom: "var(--space-5)" }}>
                <StatItem label="Toplam Ekipman" value={summary.totalAssets} tone="primary" />
                <StatItem label="Çalışır Durumda" value={summary.workingCount} tone="success" />
                <StatItem label="Arızalı" value={summary.faultyCount} tone="danger" />
                <StatItem label="Bölge Sayısı" value={summary.totalRegions} />
              </div>

              {summary.assetTypeBreakdown && Object.keys(summary.assetTypeBreakdown).length > 0 && (
                <div style={{ marginBottom: "var(--space-5)" }}>
                  <h3 style={{ marginBottom: "var(--space-3)" }}>Ekipman Türüne Göre Dağılım</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {Object.entries(summary.assetTypeBreakdown).map(([type, count]) => (
                      <li
                        key={type}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom: "1px solid var(--color-border)",
                          fontSize: 13.5,
                        }}
                      >
                        <span>{assetTypeLabel(type)}</span>
                        <strong>{count}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.regions && summary.regions.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: "var(--space-3)" }}>Bölgeler</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {summary.regions.map((r, idx) => (
                      <li
                        key={`${r.regionName}-${idx}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom: "1px solid var(--color-border)",
                          fontSize: 13.5,
                        }}
                      >
                        <span>
                          {r.regionName}{" "}
                          <span style={{ color: "var(--color-text-faint)" }}>({r.districtName})</span>
                        </span>
                        <strong>{r.assetCount} ekipman</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="login-help" style={{ marginTop: "var(--space-5)" }}>
            <Link to="/giris">Personel girişi →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
