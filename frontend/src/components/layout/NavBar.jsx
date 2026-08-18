import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isAdmin, isManager } from "../../utils/roles";
import "../../styles/layout.css";

export default function NavBar() {
  const { role } = useAuth();

  // Harita ve Cihazlar sekmeleri birleştirildi — artık tek bir link (/harita).
  const links = [
    { to: "/", label: "Anasayfa", visible: true },
    { to: "/bolgeler", label: "Bölgeler", visible: isAdmin(role) },
    { to: "/harita", label: "Harita ve Cihazlar", visible: true },
    { to: "/talepler", label: "Talepler", visible: isManager(role) },
    { to: "/kullanicilar", label: "Kullanıcılar", visible: isAdmin(role) },
    { to: "/loglar", label: "İşlem Geçmişi", visible: isManager(role) },
  ].filter((l) => l.visible);

  return (
    <nav className="app-nav">
      <div className="app-nav-inner container">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) => "app-nav-link" + (isActive ? " is-active" : "")}
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
