import EmptyState from "../common/EmptyState";
import Loading from "../common/Loading";
import Button from "../common/Button";
import { formatDateTime } from "../../utils/format";
import { actionColors, resourceLabel } from "../../utils/auditActions";
import "../../styles/table.css";

export default function LogTable({ logs, onViewDetail }) {
  if (logs === null) return <Loading />;
  if (logs.length === 0) return <EmptyState>Kayıtlı işlem geçmişi bulunamadı.</EmptyState>;

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Kullanıcı</th>
            <th>İşlem</th>
            <th>Kaynak</th>
            <th>Detay</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => {
            const colors = actionColors(l.action);
            return (
              <tr key={l.id}>
                <td className="cell-muted">{formatDateTime(l.timestamp)}</td>
                <td>
                  {l.username}
                  {l.userRole && <span className="cell-muted"> ({l.userRole})</span>}
                </td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: colors.bg,
                      color: colors.fg,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {l.action}
                  </span>
                </td>
                <td className="cell-muted">
                  {resourceLabel(l.resourceType)}
                  {l.resourceId != null && ` #${l.resourceId}`}
                </td>
                <td className="cell-muted" style={{ maxWidth: 320 }}>
                  {l.details}
                </td>
                <td>
                  <Button size="sm" variant="secondary" onClick={() => onViewDetail(l)}>
                    Detay
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
