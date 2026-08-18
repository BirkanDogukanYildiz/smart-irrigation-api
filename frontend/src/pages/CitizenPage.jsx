import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import IBBLogo from "../components/common/IBBLogo";
import StatItem from "../components/common/StatItem";
import ThemeToggle from "../components/common/ThemeToggle";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import { getPublicSummary, getPublicRegionOptions, createCitizenRequest } from "../api/public";
import { assetTypeLabel } from "../utils/assetTypes";
import { REQUEST_TOPICS, requestTopicLabel } from "../utils/requestTopics";
import "../styles/form.css";
import "../styles/login.css";

// Vatandaş görünümü: hem şeffaflık özetini (eski PublicSummaryPage içeriği) hem de
// yeni "Talep Oluştur" formunu tek bir sayfada topluyor. Kimlik doğrulama GEREKTİRMEZ
// (bkz. SecurityConfig — GET /api/public/**, POST /api/public/requests permitAll).
// Eski /seffaflik URL'i buraya (/vatandas) yönlendiriliyor, eski bookmark'lar kırılmasın diye.
export default function CitizenPage() {
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");

  const [regions, setRegions] = useState([]);
  const [topic, setTopic] = useState(REQUEST_TOPICS.ARIZA_BILDIRIMI);
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [regionId, setRegionId] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getPublicSummary()
      .then(setSummary)
      .catch((e) => setSummaryError(e.message));
    getPublicRegionOptions()
      .then(setRegions)
      .catch(() => {
        // Bölge listesi yüklenemezse dropdown boş kalır, formun geri kalanı yine de kullanılabilir.
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim()) {
      setFormError("Ad soyad boş olamaz.");
      return;
    }
    if (!message.trim()) {
      setFormError("Talep mesajı boş olamaz.");
      return;
    }

    setSubmitting(true);
    try {
      await createCitizenRequest({
        topic,
        fullName: fullName.trim(),
        contact: contact.trim() || null,
        regionId: regionId ? Number(regionId) : null,
        message: message.trim(),
      });
      setSubmitted(true);
      setFullName("");
      setContact("");
      setRegionId("");
      setMessage("");
      setTopic(REQUEST_TOPICS.ARIZA_BILDIRIMI);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page" style={{ alignItems: "flex-start", paddingTop: "var(--space-7)", paddingBottom: "var(--space-7)" }}>
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="login-card" style={{ maxWidth: 620 }}>
        <div className="login-brand">
          <IBBLogo size={40} />
          <h1>Park Takip Sistemi — Vatandaş Görünümü</h1>
          <div className="login-sub">İstanbul Büyükşehir Belediyesi · Park ve Bahçeler</div>
        </div>

        {/* --- Genel durum özeti --- */}
        <div className="login-body">
          <h2>Genel Durum</h2>
          <p>Sistemdeki park/bahçe ekipmanlarının anlık, herkese açık özeti.</p>

          {summaryError && (
            <p style={{ color: "var(--color-danger)", marginBottom: 16 }}>
              Veriler şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.
            </p>
          )}
          {!summary && !summaryError && <p>Yükleniyor...</p>}

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
        </div>

        {/* --- Talep oluştur --- */}
        <div className="login-body" style={{ marginTop: "var(--space-4)" }}>
          <h2>Talep Oluştur</h2>
          <p>Bir arıza bildirmek, bakım talep etmek veya öneri/şikayetinizi iletmek için aşağıdaki formu doldurun.</p>

          {submitted ? (
            <>
              <Alert type="success">
                Talebiniz başarıyla alındı. İlgili ekip en kısa sürede inceleyecektir.
              </Alert>
              <Button variant="secondary" onClick={() => setSubmitted(false)} style={{ marginTop: 12 }}>
                Yeni Talep Oluştur
              </Button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <Alert type="error">{formError}</Alert>

              <div className="form-field" style={{ marginBottom: 12 }}>
                <label htmlFor="reqTopic">Konu</label>
                <select id="reqTopic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {Object.values(REQUEST_TOPICS).map((t) => (
                    <option key={t} value={t}>
                      {requestTopicLabel(t)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field" style={{ marginBottom: 12 }}>
                <label htmlFor="reqFullName">Ad Soyad</label>
                <input
                  id="reqFullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                />
              </div>

              <div className="form-field" style={{ marginBottom: 12 }}>
                <label htmlFor="reqContact">İletişim (opsiyonel)</label>
                <input
                  id="reqContact"
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Telefon veya e-posta"
                />
              </div>

              {regions.length > 0 && (
                <div className="form-field" style={{ marginBottom: 12 }}>
                  <label htmlFor="reqRegion">Hangi Park/Bölge İle İlgili? (opsiyonel)</label>
                  <select id="reqRegion" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                    <option value="">— Belirtmek istemiyorum —</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.regionName} ({r.districtName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-field" style={{ marginBottom: 16 }}>
                <label htmlFor="reqMessage">Mesajınız</label>
                <textarea
                  id="reqMessage"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Talebinizi kısaca açıklayın..."
                />
              </div>

              <Button type="submit" variant="primary" disabled={submitting} className="login-submit">
                {submitting ? "Gönderiliyor..." : "Talebi Gönder"}
              </Button>
            </form>
          )}
        </div>

        <div className="login-help" style={{ marginTop: "var(--space-5)" }}>
          <Link to="/giris">← Giriş seçimine dön</Link>
        </div>
      </div>
    </main>
  );
}
