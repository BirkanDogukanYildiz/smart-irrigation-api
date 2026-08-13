import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RequireRole } from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DevicesPage from "./pages/DevicesPage";
import MapPage from "./pages/MapPage";
import RegionsPage from "./pages/RegionsPage";
import UsersPage from "./pages/UsersPage";
import LogsPage from "./pages/LogsPage";
import PublicSummaryPage from "./pages/PublicSummaryPage";
import { ROLES } from "./utils/roles";

export default function App() {
  return (
    // ThemeProvider en dışta: /giris ve /seffaflik gibi kimlik doğrulama
    // gerektirmeyen sayfalar da dahil, HER sayfada tema tercihi çalışsın diye.
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/giris" element={<LoginPage />} />

            {/* Faz 6-A: login gerektirmeyen, vatandaşa açık şeffaflık sayfası. */}
            <Route path="/seffaflik" element={<PublicSummaryPage />} />

            <Route
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/harita" element={<MapPage />} />

              <Route
                path="/cihazlar"
                element={
                  <RequireRole allow={[ROLES.ADMIN, ROLES.HEADGARDENER]}>
                    <DevicesPage />
                  </RequireRole>
                }
              />
              <Route
                path="/loglar"
                element={
                  <RequireRole allow={[ROLES.ADMIN, ROLES.HEADGARDENER]}>
                    <LogsPage />
                  </RequireRole>
                }
              />
              <Route
                path="/bolgeler"
                element={
                  <RequireRole allow={[ROLES.ADMIN]}>
                    <RegionsPage />
                  </RequireRole>
                }
              />
              <Route
                path="/kullanicilar"
                element={
                  <RequireRole allow={[ROLES.ADMIN]}>
                    <UsersPage />
                  </RequireRole>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
