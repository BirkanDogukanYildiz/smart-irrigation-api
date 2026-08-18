import { useEffect, useState } from "react";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import RequestTable from "../components/requests/RequestTable";
import { listRequests, markRequestReviewed } from "../api/requests";
import { REQUEST_TOPICS, REQUEST_STATUS, requestTopicLabel, requestStatusLabel } from "../utils/requestTopics";

// Vatandaşların (/vatandas üzerinden, girişsiz) oluşturduğu talepleri kronolojik
// bir log gibi listeler. Sadece ADMIN + HEADGARDENER erişebilir (bkz. App.jsx
// RequireRole + backend SecurityConfig) — İşlem Geçmişi ile aynı yetki seviyesi.
export default function RequestsPage() {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function loadRequests() {
    try {
      const data = await listRequests({ topic: topicFilter || undefined, status: statusFilter || undefined });
      setRequests(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicFilter, statusFilter]);

  async function handleMarkReviewed(request) {
    try {
      await markRequestReviewed(request.id);
      loadRequests();
    } catch (e) {
      window.alert("Talep güncellenemedi: " + e.message);
    }
  }

  return (
    <Section
      title="Talepler"
      subtitle="Vatandaşların /vatandas üzerinden oluşturduğu talep ve şikayetler."
      actions={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}>
            <option value="">Tüm konular</option>
            {Object.values(REQUEST_TOPICS).map((t) => (
              <option key={t} value={t}>
                {requestTopicLabel(t)}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tüm durumlar</option>
            {Object.values(REQUEST_STATUS).map((s) => (
              <option key={s} value={s}>
                {requestStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <Alert type="error">{error}</Alert>
      {requests && (
        <p className="hint" style={{ marginBottom: "var(--space-3)" }}>
          {requests.length} talep bulundu.
        </p>
      )}
      <RequestTable requests={requests} onMarkReviewed={handleMarkReviewed} />
    </Section>
  );
}
