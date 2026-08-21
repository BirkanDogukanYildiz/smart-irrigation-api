import { NavLink } from "react-router-dom";
import IBBLogo from "../common/IBBLogo";
import Icon from "../common/Icon";
import "../../styles/sidebar.css";

// Personel tarafının Sidebar.jsx'i ile AYNI görsel dili kullanır (renk/spacing/
// radius/etkileşim), ama kimlik doğrulama gerektirmez ve personel navigasyonundan
// tamamen bağımsızdır — sadece vatandaşa açık 3 sayfaya gider.
export default function CitizenSidebar({ collapsed, onToggle }) {
  const links = [
    { to: "/vatandas", label: "Ana Sayfa", icon: "home", end: true },
    { to: "/vatandas/parklar", label: "Parklar", icon: "park", end: false },
    { to: "/vatandas/talep-olustur", label: "Talep Oluştur", icon: "document", end: false },
  ];

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
              <div className="sidebar-brand-sub">Vatandaş Paneli</div>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-group-label">HİZMETLER</div>}
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => "sidebar-link" + (isActive ? " is-active" : "")}
          >
            <span className="sidebar-link-icon"><Icon name={l.icon} size={17} /></span>
            {!collapsed && <span>{l.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
