import { useState } from "react";
import Section from "../common/Section";
import Alert from "../common/Alert";
import Button from "../common/Button";
import { registerUser } from "../../api/users";
import { ROLES, ROLE_LABELS } from "../../utils/roles";
import "../../styles/form.css";

export default function UserForm({ onCreated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(ROLES.GARDENER);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const created = await registerUser({ username: username.trim(), password, role });
      setSuccess(`'${created.username}' başarıyla eklendi.`);
      setUsername("");
      setPassword("");
      setRole(ROLES.GARDENER);
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section title="Yeni Kullanıcı Ekle">
      <form onSubmit={handleSubmit}>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="regUsername">Kullanıcı Adı</label>
            <input id="regUsername" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="regPassword">Şifre</label>
            <input id="regPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="regRole">Rol</label>
            <select id="regRole" value={role} onChange={(e) => setRole(e.target.value)}>
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Ekleniyor..." : "Kullanıcı Ekle"}
          </Button>
        </div>
      </form>
    </Section>
  );
}
