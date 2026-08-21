import { NavLink } from "react-router-dom";
import IBBLogo from "../common/IBBLogo";
import Icon from "../common/Icon";
import { useAuth } from "../../context/AuthContext";
import { isAdmin, isManager } from "../../utils/roles";
import "../../styles/sidebar.css";

// Referans mockup'taki sol sidebar navigasyonu. Eski üst NavBar'ın (yatay sekmeler)
// yerini alır — AYNI route'lara, AYNI rol bazlı görünürlük kurallarına gider,
// sadece sunum şekli değişti. "Kategoriler" (yeni /kategoriler sayfası) ekipman
// TÜRLERİNİ listeler — mevcut AssetType verisini yeniden kullanır, yeni bir veri
// modeli YOK. "Talep Oluştur" mockup'ta vardı ama personel tarafında karşılığı yok
// (talep oluşturma sadece vatandaş tarafında, /vatandas üzerinden) — bu yüzden
// personel sidebar'ına BİLİNÇLİ OLARAK eklenmedi, sahte bir özellik uydurulmadı.
export default function Sidebar({ collapsed, onToggle }) {
  const { role } = useAuth();

  const managementLinks = [
    { to: "/bolgeler", label: "Bölgeler", icon: "park", visible: isAdmin(role) },
    { to: "/harita", label: "Harita ve Cihazlar", icon: "map", visible: true },
    { to: "/kategoriler", label: "Kategoriler", icon: "box", visible: true },
    { to: "/talepler", label: "Talepler", icon: "clipboard", visible: isManager(role) },
    { to: "/kullanicilar", label: "Kullanıcılar", icon: "users", visible: isAdmin(role) },
  ].filter((l) => l.visible);

  const operationLinks = [
    { to: "/loglar", label: "İşlem Geçmişi", icon: "clock", visible: isManager(role) },
  ].filter((l) => l.visible);

  const userLinks = [
    { to: "/profil", label: "Profil", icon: "user", visible: true },
  ].filter((l) => l.visible);

  return (
    <aside className={"sidebar" + (collapsed ? " is-collapsed" : "")}>
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Menüyü daralt/genişlet">
          <Icon name="layers" size={16} />
        </button>
        {!collapsed && (
          <div className="sidebar-brand">
            <IBBLogo size={30} />
            <div>
              <div className="sidebar-brand-title">Belediyesi</div>
              <div className="sidebar-brand-sub">Park ve Ekipman Takip Sistemi</div>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => "sidebar-link" + (isActive ? " is-active" : "")}>
          <span className="sidebar-link-icon"><Icon name="home" size={17} /></span>
          {!collapsed && <span>Ana Sayfa</span>}
        </NavLink>

        {managementLinks.length > 0 && (
          <>
            {!collapsed && <div className="sidebar-group-label">YÖNETİM</div>}
            {managementLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => "sidebar-link" + (isActive ? " is-active" : "")}>
                <span className="sidebar-link-icon"><Icon name={l.icon} size={17} /></span>
                {!collapsed && <span>{l.label}</span>}
              </NavLink>
            ))}
          </>
        )}

        {operationLinks.length > 0 && (
          <>
            {!collapsed && <div className="sidebar-group-label">İŞLEMLER</div>}
            {operationLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => "sidebar-link" + (isActive ? " is-active" : "")}>
                <span className="sidebar-link-icon"><Icon name={l.icon} size={17} /></span>
                {!collapsed && <span>{l.label}</span>}
              </NavLink>
            ))}
          </>
        )}

        {!collapsed && <div className="sidebar-group-label">KULLANICI</div>}
        {userLinks.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => "sidebar-link" + (isActive ? " is-active" : "")}>
            <span className="sidebar-link-icon"><Icon name={l.icon} size={17} /></span>
            {!collapsed && <span>{l.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
