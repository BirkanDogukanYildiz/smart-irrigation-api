import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";
import Icon from "../common/Icon";
import NotificationBell from "./NotificationBell";
import WeatherWidget from "./WeatherWidget";
import { useAuth } from "../../context/AuthContext";
import { roleLabel } from "../../utils/roles";
import "../../styles/sidebar.css";

export default function TopBar() {
  const { username, role, photoBase64, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const initial = (username || "?").charAt(0).toUpperCase();

  useEffect(() => {
    function handleOutsideClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [menuOpen]);

  return (
    <header className="topbar">
      {/* Not: arama kutusu şu an sistem genelinde tek bir hedefe bağlı değil (cihaz/
          bölge/talep aramaları kendi sayfalarında zaten mevcut) — bu yüzden burada
          sahte bir "her şeyi arar" kutusu yerine, harita/cihaz aramasına yönlendiren
          gerçek bir kısayol olarak bırakıldı. */}
      <Link to="/harita" className="topbar-search">
        <Icon name="search" size={15} />
        <span>Cihaz, bölge ara...</span>
      </Link>

      <div className="topbar-right">
        <WeatherWidget />
        <NotificationBell />
        <ThemeToggle />

        <div className="topbar-user" ref={menuRef}>
          <button className="topbar-user-btn" onClick={() => setMenuOpen((o) => !o)}>
            {photoBase64 ? (
              <img src={photoBase64} alt={username} className="topbar-avatar-img" />
            ) : (
              <div className="topbar-avatar">{initial}</div>
            )}
            <div className="topbar-user-text">
              <div className="topbar-user-name">{username}</div>
              <div className="topbar-user-role">{roleLabel(role)}</div>
            </div>
            <Icon name="chevronDown" size={13} style={{ color: "var(--color-text-faint)" }} />
          </button>

          {menuOpen && (
            <div className="topbar-menu">
              <Link to="/profil" className="topbar-menu-item" onClick={() => setMenuOpen(false)}>
                <Icon name="user" size={15} /> Profil
              </Link>
              <button className="topbar-menu-item" onClick={logout}>
                <Icon name="logout" size={15} /> Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
