import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RequireRole } from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DeviceDetailPage from "./pages/DeviceDetailPage";
import MapPage from "./pages/MapPage";
import RegionsPage from "./pages/RegionsPage";
import RegionDetailPage from "./pages/RegionDetailPage";
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

              {/* Detay sayfaları: liste sayfalarının aksine (isManager/isAdmin gerektirir),
                  tekil kayıt görüntüleme tüm rollere açık — backend GET endpoint'leri zaten
                  ADMIN/GARDENER/HEADGARDENER'a izin veriyor (SecurityConfig), görünürlük
                  (hangi bölge/cihaz görülebilir) servis katmanında filtreleniyor. */}
              <Route path="/cihazlar/:id" element={<DeviceDetailPage />} />
              <Route path="/bolgeler/:id" element={<RegionDetailPage />} />

              {/* Harita ve Cihazlar sekmeleri BİRLEŞTİRİLDİ — eski /cihazlar listeleme
                  route'u artık /harita'ya yönleniyor (eski bookmark/linkler kırılmasın). */}
              <Route path="/cihazlar" element={<Navigate to="/harita" replace />} />

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
