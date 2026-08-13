import IBBLogo from "../common/IBBLogo";
import ThemeToggle from "../common/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import "../../styles/layout.css";

export default function Header() {
  const { username, logout } = useAuth();
  const initial = (username || "?").charAt(0).toUpperCase();

  return (
    <header className="app-header">
      <div className="app-header-inner container">
        <div className="app-brand">
          <IBBLogo size={34} />
          <div className="app-brand-text">
            <h1>Park Takip Sistemi</h1>
            <div className="app-brand-sub">İstanbul Büyükşehir Belediyesi · Park ve Bahçeler</div>
          </div>
        </div>

        <div className="app-user">
          <ThemeToggle />
          <div className="app-user-avatar">{initial}</div>
          <span className="app-user-name">{username}</span>
          <button className="app-logout" onClick={logout}>
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
}
