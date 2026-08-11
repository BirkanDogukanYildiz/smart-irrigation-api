import EmptyState from "../common/EmptyState";
import Loading from "../common/Loading";
import { formatDateTime } from "../../utils/format";
import "../../styles/table.css";

export default function LogTable({ logs }) {
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
            <th>Detay</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td className="cell-muted">{formatDateTime(l.timestamp)}</td>
              <td>{l.username}</td>
              <td>{l.action}</td>
              <td className="cell-muted">{l.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
