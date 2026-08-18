import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import Loading from "../common/Loading";
import { requestTopicLabel, requestStatusLabel, REQUEST_STATUS } from "../../utils/requestTopics";
import { formatDateTime } from "../../utils/format";
import "../../styles/table.css";

export default function RequestTable({ requests, onMarkReviewed }) {
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
            <th>Bölge</th>
            <th>Mesaj</th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{formatDateTime(r.createdAt)}</td>
              <td>{requestTopicLabel(r.topic)}</td>
              <td>{r.fullName}</td>
              <td>{r.contact || "—"}</td>
              <td>{r.regionName ? `${r.regionName} (${r.districtName})` : "—"}</td>
              <td style={{ maxWidth: 280, whiteSpace: "pre-wrap" }}>{r.message}</td>
              <td>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    background: r.status === REQUEST_STATUS.YENI ? "var(--color-primary-light)" : "var(--color-success-bg)",
                    color: r.status === REQUEST_STATUS.YENI ? "var(--color-primary-dark)" : "var(--color-success)",
                  }}
                >
                  {requestStatusLabel(r.status)}
                </span>
              </td>
              <td>
                {r.status === REQUEST_STATUS.YENI ? (
                  <Button size="sm" variant="secondary" onClick={() => onMarkReviewed(r)}>
                    İncelendi İşaretle
                  </Button>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
