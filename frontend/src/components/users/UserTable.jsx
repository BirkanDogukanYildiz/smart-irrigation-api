import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import Loading from "../common/Loading";
import { roleLabel, ROLES } from "../../utils/roles";
import { useAuth } from "../../context/AuthContext";
import "../../styles/table.css";

export default function UserTable({ users, headGardeners, onAssignHeadGardener, onDelete }) {
  const { username: currentUsername } = useAuth();

  if (users === null) return <Loading />;
  if (users.length === 0) return <EmptyState>Kayıtlı kullanıcı bulunamadı.</EmptyState>;

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Kullanıcı Adı</th>
            <th>Rol</th>
            <th>Bağlı Olduğu Baş Bahçivan</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.username === currentUsername;
            return (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td className="cell-muted">{roleLabel(u.role)}</td>
                <td>
                  {u.role === ROLES.GARDENER ? (
                    headGardeners.length === 0 ? (
                      <span className="cell-muted">Sistemde henüz Baş Bahçivan yok</span>
                    ) : (
                      <select
                        value={u.headGardenerId ?? ""}
                        onChange={(e) =>
                          onAssignHeadGardener(u.id, e.target.value ? Number(e.target.value) : null)
                        }
                      >
                        <option value="">— Atanmadı —</option>
                        {headGardeners.map((hg) => (
                          <option key={hg.id} value={hg.id}>
                            {hg.username}
                          </option>
                        ))}
                      </select>
                    )
                  ) : (
                    <span className="cell-muted">—</span>
                  )}
                </td>
                <td className="cell-actions">
                  {isSelf ? (
                    <span className="cell-muted" style={{ fontWeight: 600, fontSize: 11 }}>
                      SENİN HESABIN
                    </span>
                  ) : (
                    <Button size="sm" variant="danger" onClick={() => onDelete(u)}>
                      Sil
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
