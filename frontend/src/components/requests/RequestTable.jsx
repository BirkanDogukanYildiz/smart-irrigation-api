import EmptyState from "../common/EmptyState";
import Loading from "../common/Loading";
import { requestTopicLabel, requestStatusLabel, REQUEST_STATUS } from "../../utils/requestTopics";
import { formatDateTime } from "../../utils/format";
import { regionDisplayName } from "../../utils/regionDisplay";
import "../../styles/table.css";

const STATUS_TONE = {
  [REQUEST_STATUS.YENI]: { bg: "var(--color-primary-light)", fg: "var(--color-primary-dark)" },
  [REQUEST_STATUS.INCELENIYOR]: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" },
  [REQUEST_STATUS.INCELENDI]: { bg: "var(--color-success-bg)", fg: "var(--color-success)" },
};

// onStatusChange(request, newStatus): İncelenmedi ⇄ İnceleniyor ⇄ İncelendi arasında
// İKİ YÖNLÜ, serbest geçiş — <select> ile hangi duruma gidilirse gidilsin çağrılır.
// "İncelendi" seçilirse çağıran taraf (RequestsPage) önce opsiyonel not modalını açar,
// bu tablo sadece "kullanıcı İncelendi'yi seçti" bilgisini iletir, kararı vermez.
export default function RequestTable({ requests, onStatusChange }) {
  if (requests === null) return <Loading />;
  if (requests.length === 0) return <EmptyState>Kayıtlı talep yok.</EmptyState>;

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Konu</th>
            <th>Ad Soyad</th>
            <th>İletişim</th>
            <th>Park</th>
            <th>Mesaj</th>
            <th>Not</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => {
            const tone = STATUS_TONE[r.status] || STATUS_TONE[REQUEST_STATUS.YENI];
            return (
              <tr key={r.id}>
                <td>{formatDateTime(r.createdAt)}</td>
                <td>{requestTopicLabel(r.topic)}</td>
                <td>{r.fullName}</td>
                <td>{r.contact || "—"}</td>
                <td>{r.regionName ? regionDisplayName(r) : "—"}</td>
                <td style={{ maxWidth: 260, whiteSpace: "pre-wrap" }}>{r.message}</td>
                <td style={{ maxWidth: 220, whiteSpace: "pre-wrap", color: "var(--color-text-muted)" }}>
                  {r.reviewNote || "—"}
                </td>
                <td>
                  <select
                    value={r.status}
                    onChange={(e) => onStatusChange(r, e.target.value)}
                    style={{
                      background: tone.bg,
                      color: tone.fg,
                      fontWeight: 600,
                      border: "none",
                      borderRadius: 999,
                      padding: "4px 10px",
                      fontSize: 12.5,
                    }}
                  >
                    {Object.values(REQUEST_STATUS).map((s) => (
                      <option key={s} value={s}>
                        {requestStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
