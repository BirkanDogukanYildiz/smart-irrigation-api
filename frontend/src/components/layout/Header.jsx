import IBBLogo from "../common/IBBLogo";
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
            <h1>Bitki Sulama Yönetim Paneli</h1>
            <div className="app-brand-sub">İstanbul Büyükşehir Belediyesi · Park ve Bahçeler</div>
          </div>
        </div>

        <div className="app-user">
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
