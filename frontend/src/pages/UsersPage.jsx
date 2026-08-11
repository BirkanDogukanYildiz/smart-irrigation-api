import { useEffect, useState } from "react";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import UserForm from "../components/users/UserForm";
import UserTable from "../components/users/UserTable";
import { listUsers, assignUserHeadGardener, deleteUser } from "../api/users";
import { ROLES } from "../utils/roles";

export default function UsersPage() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");

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
      <Section title="Kullanıcılar">
        <Alert type="error">{error}</Alert>
        <UserTable
          users={users}
          headGardeners={headGardeners}
          onAssignHeadGardener={handleAssign}
          onDelete={handleDelete}
        />
      </Section>

      <UserForm onCreated={loadUsers} />
    </>
  );
}
