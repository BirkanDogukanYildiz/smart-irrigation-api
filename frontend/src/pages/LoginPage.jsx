import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import IBBLogo from "../components/common/IBBLogo";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import ThemeToggle from "../components/common/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import "../styles/form.css";
import "../styles/login.css";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch {
      setError("Giriş başarısız: kullanıcı adı veya şifre hatalı.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-theme-toggle">
        <ThemeToggle />
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <IBBLogo size={40} />
          <h1>Park Takip Sistemi</h1>
          <div className="login-sub">İstanbul Büyükşehir Belediyesi · Akıllı Park ve Bahçe Sistemleri</div>
        </div>

        <div className="login-body">
          <h2>Giriş Yap</h2>
          <p>Devam etmek için kullanıcı adı ve şifreni gir.</p>

          <Alert type="error">{error}</Alert>

          <div className="form-field">
            <label htmlFor="loginUsername">Kullanıcı Adı</label>
            <input
              id="loginUsername"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-field" style={{ marginTop: 12, marginBottom: 20 }}>
            <label htmlFor="loginPassword">Şifre</label>
            <input
              id="loginPassword"
              type="password"
              placeholder="••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" disabled={submitting} className="login-submit">
            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>

          <div className="login-help">
            Test hesapları — <code>admin / 1234</code> · <code>ahmet.demir / 1234</code> ·{" "}
            <code>mehmet.yilmaz / 1234</code>
          </div>

          <div className="login-help" style={{ marginTop: 8 }}>
            <Link to="/giris">← Giriş seçimine dön</Link>
          </div>
        </div>
      </form>
    </main>
  );
}
