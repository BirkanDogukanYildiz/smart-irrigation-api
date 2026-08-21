import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "../../styles/sidebar.css";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell-sidebar">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="sidebar-content">
        <TopBar />
        <main className="sidebar-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
