import { useState } from "react";
import { Outlet } from "react-router-dom";
import CitizenSidebar from "./CitizenSidebar";
import CitizenTopBar from "./CitizenTopBar";
import "../../styles/sidebar.css";

// Personel tarafının Layout.jsx'i (Sidebar+TopBar+Outlet) ile AYNI iskelet
// mantığını kullanır, ama kimlik doğrulama gerektirmez ve personel navigasyonundan
// tamamen bağımsızdır. Vatandaş servisleri tek bir sayfaya sıkıştırılmak yerine
// kendi sekmelerine ayrıldı (bkz. App.jsx routing).
export default function CitizenLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell-sidebar">
      <CitizenSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="sidebar-content">
        <CitizenTopBar />
        <main className="sidebar-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
