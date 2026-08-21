import { Link } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";
import "../../styles/sidebar.css";

// Personel TopBar.jsx ile aynı görsel dil, ama kimlik doğrulama GEREKTİRMEYEN
// bir bağlamda olduğu için bildirim/kullanıcı menüsü/hava durumu YOK (hava durumu
// endpoint'i ADMIN/GARDENER/HEADGARDENER'a kısıtlı, bkz. SecurityConfig) — sadece
// tema değiştirici ve personel girişine dönüş linki.
export default function CitizenTopBar() {
  return (
    <header className="topbar">
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-muted)" }}>
        Vatandaş Görünümü — Kimlik doğrulama gerektirmez
      </div>
      <div className="topbar-right">
        <ThemeToggle />
        <Link to="/giris/personel" className="btn btn-secondary btn-sm">
          Personel Girişi
        </Link>
      </div>
    </header>
  );
}
