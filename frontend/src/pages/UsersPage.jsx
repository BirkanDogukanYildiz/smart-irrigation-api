import { useEffect, useState } from "react";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import PaginationControls from "../components/common/PaginationControls";
import UserForm from "../components/users/UserForm";
import UserTable from "../components/users/UserTable";
import { listUsers, searchUsers, assignUserHeadGardener, deleteUser } from "../api/users";
import { ROLES, roleLabel } from "../utils/roles";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [users, setUsers] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);

  const [headGardeners, setHeadGardeners] = useState([]);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  async function loadUsers() {
    try {
      const result = await searchUsers({ page, size: PAGE_SIZE, role: roleFilter || undefined, q: search || undefined });
      setUsers(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (e) {
      setError(e.message);
    }
  }

  // "Baş bahçivan ata" dropdown'ı her zaman TÜM baş bahçivanları göstermeli — sayfalanmış
  // tablo listesinden bağımsız, ayrı (küçük, filtresiz) bir çağrı ile doldurulur.
  async function loadHeadGardeners() {
    try {
      const all = await listUsers();
      setHeadGardeners(all.filter((u) => u.role === ROLES.HEADGARDENER));
    } catch {
      // Yüklenemezse dropdown boş kalır, sayfa yine de kullanılabilir.
    }
  }

  useEffect(() => {
    loadHeadGardeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, search]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, search]);

  async function handleAssign(gardenerId, headGardenerId) {
    try {
      await assignUserHeadGardener(gardenerId, headGardenerId);
      loadUsers();
    } catch (e) {
      window.alert("Baş bahçivan ataması yapılamadı: " + e.message);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`'${user.username}' adlı kullanıcıyı silmek istediğinize emin misiniz?`)) return;
    try {
      await deleteUser(user.username);
      loadUsers();
      loadHeadGardeners();
    } catch (e) {
      window.alert("Kullanıcı silinemedi: " + e.message);
    }
  }

  return (
    <>
      <Section
        title="Kullanıcılar"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Kullanıcı adı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Tüm roller</option>
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <Alert type="error">{error}</Alert>
        {totalElements > 0 && (
          <p className="hint" style={{ marginBottom: "var(--space-3)" }}>
            {totalElements} kullanıcı bulundu.
          </p>
        )}
        <UserTable
          users={users}
          headGardeners={headGardeners}
          onAssignHeadGardener={handleAssign}
          onDelete={handleDelete}
        />
        <PaginationControls page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </Section>

      <UserForm onCreated={() => { loadUsers(); loadHeadGardeners(); }} />
    </>
  );
}
