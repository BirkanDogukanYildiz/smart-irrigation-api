import { useEffect, useMemo, useState } from "react";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import UserForm from "../components/users/UserForm";
import UserTable from "../components/users/UserTable";
import { listUsers, assignUserHeadGardener, deleteUser } from "../api/users";
import { ROLES, roleLabel } from "../utils/roles";

export default function UsersPage() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  async function loadUsers() {
    try {
      setUsers(await listUsers());
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const headGardeners = (users || []).filter((u) => u.role === ROLES.HEADGARDENER);

  const filteredUsers = useMemo(() => {
    if (!users) return users;
    const searchLower = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (searchLower && !u.username.toLowerCase().includes(searchLower)) return false;
      return true;
    });
  }, [users, roleFilter, search]);

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
    } catch (e) {
      window.alert("Kullanıcı silinemedi: " + e.message);
    }
  }

  return (
    <>
      <Section
        title="Kullanıcılar"
        actions={
          users && users.length > 0 ? (
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
          ) : null
        }
      >
        <Alert type="error">{error}</Alert>
        <UserTable
          users={filteredUsers}
          headGardeners={headGardeners}
          onAssignHeadGardener={handleAssign}
          onDelete={handleDelete}
        />
      </Section>

      <UserForm onCreated={loadUsers} />
    </>
  );
}
