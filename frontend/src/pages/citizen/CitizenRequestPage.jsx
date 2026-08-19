import { useEffect, useState } from "react";
import Section from "../../components/common/Section";
import PageHeader from "../../components/common/PageHeader";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import { getPublicRegionOptions, createCitizenRequest } from "../../api/public";
import { REQUEST_TOPICS, requestTopicLabel } from "../../utils/requestTopics";
import { regionDisplayName } from "../../utils/regionDisplay";
import "../../styles/form.css";

// Vatandaş "Talep Oluştur" sayfası: kimlik doğrulama gerektirmez. Personel tarafında
// "Talepler" (bkz. RequestsPage.jsx) burada oluşturulan kayıtları listeler.
export default function CitizenRequestPage() {
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
    <>
      <PageHeader
        title="Talep Oluştur"
        subtitle="Bir arıza bildirmek, bakım talep etmek veya öneri/şikayetinizi iletmek için aşağıdaki formu doldurun."
      />

      <Section>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "var(--space-5) 0" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "var(--color-success-bg)",
                color: "var(--color-success)",
                fontSize: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4)",
              }}
              aria-hidden="true"
            >
              ✓
            </div>
            <h3 style={{ marginBottom: 6 }}>Talebiniz alındı</h3>
            <Alert type="success">İlgili ekip talebinizi en kısa sürede inceleyecektir.</Alert>
            <Button variant="secondary" onClick={() => setSubmitted(false)} style={{ marginTop: 16 }}>
              Yeni Talep Oluştur
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
          <Alert type="error">{formError}</Alert>

          <div className="form-field" style={{ marginBottom: 14 }}>
            <label htmlFor="reqTopic">Konu</label>
            <select id="reqTopic" value={topic} onChange={(e) => setTopic(e.target.value)}>
              {Object.values(REQUEST_TOPICS).map((t) => (
                <option key={t} value={t}>
                  {requestTopicLabel(t)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field" style={{ marginBottom: 14 }}>
            <label htmlFor="reqFullName">Ad Soyad</label>
            <input
              id="reqFullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Adınız Soyadınız"
            />
          </div>

          <div className="form-field" style={{ marginBottom: 14 }}>
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
            <div className="form-field" style={{ marginBottom: 14 }}>
              <label htmlFor="reqRegion">Hangi Park/Bölge İle İlgili? (opsiyonel)</label>
              <select id="reqRegion" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                <option value="">— Belirtmek istemiyorum —</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {regionDisplayName(r)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-field" style={{ marginBottom: 18 }}>
            <label htmlFor="reqMessage">Mesajınız</label>
            <textarea
              id="reqMessage"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Talebinizi kısaca açıklayın..."
            />
          </div>

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Gönderiliyor..." : "Talebi Gönder"}
          </Button>
        </form>
        )}
      </Section>
    </>
  );
}
