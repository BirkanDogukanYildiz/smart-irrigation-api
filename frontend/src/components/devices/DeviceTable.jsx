import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import AssetTypeBadge from "../common/AssetTypeBadge";
import FaultAgeBadge from "../common/FaultAgeBadge";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import Loading from "../common/Loading";
import "../../styles/table.css";

// readOnly: true olduğunda İşlemler sütunu (arıza bildir/çalışıyor işaretle/çıkar)
// gizlenir — bölge detay sayfası gibi salt-görüntüleme bağlamlarında kullanılır.
export default function DeviceTable({ devices, onToggleStatus, onDelete, canDelete, readOnly = false }) {
  if (devices === null) return <Loading />;
  if (devices.length === 0) return <EmptyState>Henüz kayıtlı ekipman yok.</EmptyState>;

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Bölge</th>
            <th>İlçe</th>
            <th>No</th>
            <th>Tür</th>
            <th>Durum</th>
            <th>Açık Süresi</th>
            <th>Arıza Açıklaması</th>
            <th>Detay</th>
            {!readOnly && <th>İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.id}>
              <td>{d.region?.regionName}</td>
              <td className="cell-muted">{d.region?.districtName}</td>
              <td>#{d.deviceNo}</td>
              <td>
                <AssetTypeBadge type={d.assetType} />
              </td>
              <td>
                <StatusBadge status={d.status} />
              </td>
              <td>{d.status === "FAULTY" ? <FaultAgeBadge since={d.statusChangedAt} /> : "—"}</td>
              <td className="cell-muted">{d.status === "FAULTY" ? d.description : "—"}</td>
              <td>
                <Link to={`/cihazlar/${d.id}`} style={{ color: "var(--color-primary)", fontSize: 12.5 }}>
                  Detay →
                </Link>
              </td>
              {!readOnly && (
                <td className="cell-actions">
                  <Button size="sm" variant="secondary" onClick={() => onToggleStatus(d)}>
                    {d.status === "WORKING" ? "Arıza Bildir" : "Çalışıyor İşaretle"}
                  </Button>
                  {canDelete && (
                    <Button size="sm" variant="danger" onClick={() => onDelete(d)}>
                      Çıkar
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
