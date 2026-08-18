import { Outlet, NavLink, Link } from "react-router-dom";
import IBBLogo from "../common/IBBLogo";
import ThemeToggle from "../common/ThemeToggle";
import "../../styles/layout.css";

// Personel tarafının Layout.jsx'i (Header+NavBar+Outlet) ile AYNI iskelet mantığını
// kullanır, ama kimlik doğrulama gerektirmez ve personel navigasyonundan (bölgeler,
// kullanıcılar, loglar) tamamen bağımsızdır. Vatandaş servisleri artık tek bir
// sayfaya sıkıştırılmak yerine kendi sekmelerine ayrıldı (bkz. App.jsx routing).
const LINKS = [
  { to: "/vatandas", label: "Ana Sayfa" },
  { to: "/vatandas/parklar", label: "Parklar" },
  { to: "/vatandas/talep-olustur", label: "Talep Oluştur" },
];

export default function CitizenLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner container">
          <div className="app-brand">
            <IBBLogo size={34} />
            <div className="app-brand-text">
              <h1>Park Takip Sistemi</h1>
              <div className="app-brand-sub">İstanbul Büyükşehir Belediyesi · Vatandaş Paneli</div>
            </div>
          </div>

          <div className="app-user">
            <ThemeToggle />
            <Link to="/giris/personel" className="app-logout" style={{ borderColor: "var(--color-border-strong)" }}>
              Personel Girişi
            </Link>
          </div>
        </div>
      </header>

      <nav className="app-nav">
        <div className="app-nav-inner container">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/vatandas"}
              className={({ isActive }) => "app-nav-link" + (isActive ? " is-active" : "")}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="app-main container">
        <Outlet />
      </main>
    </div>
  );
}
