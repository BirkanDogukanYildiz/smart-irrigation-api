import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import AssetTypeBadge from "../common/AssetTypeBadge";
import FaultAgeBadge from "../common/FaultAgeBadge";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import Loading from "../common/Loading";
import { DEVICE_MODES, deviceModeLabel } from "../../utils/deviceMode";
import "../../styles/table.css";

const MODE_TONE = {
  BAKIMDA: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" },
  PASIF: { bg: "var(--color-bg)", fg: "var(--color-text-faint)" },
};

// readOnly: true olduğunda İşlemler sütunu (arıza bildir/çalışıyor işaretle/çıkar)
// gizlenir — bölge detay sayfası gibi salt-görüntüleme bağlamlarında kullanılır.
// onModeChange: opsiyonel — verilmezse Mod sütunu salt-metin rozet olarak kalır
// (ör. görüntüleme bağlamlarında düzenleme yetkisi olmayan roller için).
export default function DeviceTable({ devices, onToggleStatus, onDelete, canDelete, onModeChange, readOnly = false }) {
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
            <th>Mod</th>
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
              <td>
                {onModeChange ? (
                  <select
                    value={d.mode || DEVICE_MODES.NORMAL}
                    onChange={(e) => onModeChange(d, e.target.value)}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      border: "none",
                      borderRadius: 999,
                      padding: "3px 8px",
                      background: MODE_TONE[d.mode]?.bg || "var(--color-bg)",
                      color: MODE_TONE[d.mode]?.fg || "var(--color-text-faint)",
                    }}
                  >
                    {Object.values(DEVICE_MODES).map((m) => (
                      <option key={m} value={m}>
                        {deviceModeLabel(m)}
                      </option>
                    ))}
                  </select>
                ) : d.mode && d.mode !== DEVICE_MODES.NORMAL ? (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: MODE_TONE[d.mode]?.bg,
                      color: MODE_TONE[d.mode]?.fg,
                    }}
                  >
                    {deviceModeLabel(d.mode)}
                  </span>
                ) : (
                  <span className="cell-muted">—</span>
                )}
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
