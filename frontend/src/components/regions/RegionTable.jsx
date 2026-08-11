import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import Loading from "../common/Loading";
import "../../styles/table.css";

export default function RegionTable({ regions, headGardeners, onAssignHeadGardener, onDelete }) {
  if (regions === null) return <Loading />;
  if (regions.length === 0) return <EmptyState>Henüz kayıtlı bölge yok.</EmptyState>;

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Bölge No</th>
            <th>Bölge Adı</th>
            <th>İlçe</th>
            <th>Sulama Alanı</th>
            <th>Baş Bahçivan</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((r) => (
            <tr key={r.id}>
              <td>{r.regionNo}</td>
              <td>{r.regionName}</td>
              <td className="cell-muted">{r.districtName}</td>
              <td className="cell-muted">{r.irrigationAreaName}</td>
              <td>
                <select
                  value={r.headGardenerId ?? ""}
                  onChange={(e) =>
                    onAssignHeadGardener(r.id, e.target.value ? Number(e.target.value) : null)
                  }
                >
                  <option value="">— Atanmadı —</option>
                  {headGardeners.map((hg) => (
                    <option key={hg.id} value={hg.id}>
                      {hg.username}
                    </option>
                  ))}
                </select>
              </td>
              <td className="cell-actions">
                <Button size="sm" variant="danger" onClick={() => onDelete(r)}>
                  Sil
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
