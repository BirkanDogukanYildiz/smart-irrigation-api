import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import IBBLogo from "../components/common/IBBLogo";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import ThemeToggle from "../components/common/ThemeToggle";
import Icon from "../components/common/Icon";
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
    <div className="auth-shell">
      {/* --- Sol: dekoratif marka paneli --- */}
      <div className="auth-visual">
        <div className="auth-visual-pattern" />
        <div className="auth-visual-glow" />

        <div className="auth-visual-content">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <IBBLogo size={30} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Park Takip Sistemi</span>
          </div>
        </div>

        <div>
          <div className="auth-visual-icons">
            <div className="auth-visual-icon-badge is-lg">
              <Icon name="park" size={38} />
            </div>
            <div className="auth-visual-icon-badge">
              <Icon name="droplet" size={26} />
            </div>
            <div className="auth-visual-icon-badge">
              <Icon name="map" size={26} />
            </div>
          </div>
          <div className="auth-visual-title">Şehrin yeşil alanlarını tek ekrandan yönetin.</div>
          <p className="auth-visual-sub">
            Sulama sistemleri, aydınlatma ve saha ekipmanlarının anlık durumunu izleyin; arızaları,
            bakım süreçlerini ve vatandaş taleplerini tek bir platformdan koordine edin.
          </p>
        </div>

        <div className="auth-visual-footer">İstanbul Büyükşehir Belediyesi · Park ve Bahçeler</div>
      </div>

      {/* --- Sağ: form paneli --- */}
      <div className="auth-panel">
        <div className="auth-theme-toggle">
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
              <Link to="/giris" className="login-back-link">
                <Icon name="chevronLeft" size={14} /> Giriş seçimine dön
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
