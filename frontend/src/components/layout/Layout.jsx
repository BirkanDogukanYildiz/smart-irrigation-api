import { Outlet } from "react-router-dom";
import Header from "./Header";
import NavBar from "./NavBar";
import "../../styles/layout.css";

export default function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <NavBar />
      <main className="app-main container">
        <Outlet />
      </main>
    </div>
  );
}
