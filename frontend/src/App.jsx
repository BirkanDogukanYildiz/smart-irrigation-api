import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth, RequireRole } from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";
import CitizenLayout from "./components/layout/CitizenLayout";
import GateChooserPage from "./pages/GateChooserPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DeviceDetailPage from "./pages/DeviceDetailPage";
import MapPage from "./pages/MapPage";
import RegionsPage from "./pages/RegionsPage";
import RegionDetailPage from "./pages/RegionDetailPage";
import UsersPage from "./pages/UsersPage";
import LogsPage from "./pages/LogsPage";
import RequestsPage from "./pages/RequestsPage";
import CitizenDashboardPage from "./pages/citizen/CitizenDashboardPage";
import CitizenParksPage from "./pages/citizen/CitizenParksPage";
import CitizenRequestPage from "./pages/citizen/CitizenRequestPage";
import { ROLES } from "./utils/roles";

export default function App() {
  return (
    // ThemeProvider en dışta: /giris ve /vatandas gibi kimlik doğrulama
    // gerektirmeyen sayfalar da dahil, HER sayfada tema tercihi çalışsın diye.
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Giriş kapısı: "Vatandaş Girişi" / "Personel Girişi" seçimi. RequireAuth
                giriş yapılmamışsa buraya yönlendiriyor (bkz. ProtectedRoute). */}
            <Route path="/giris" element={<GateChooserPage />} />
            <Route path="/giris/personel" element={<LoginPage />} />

            {/* Vatandaş görünümü: kimlik doğrulama gerektirmez. Tek bir kalabalık sayfa
                yerine kendi amacına odaklanan ayrı sekmelere bölündü (bkz. CitizenLayout).
                Eski /seffaflik URL'i buraya yönlendiriliyor, eski bookmark/linkler kırılmasın diye. */}
            <Route path="/vatandas" element={<CitizenLayout />}>
              <Route index element={<CitizenDashboardPage />} />
              <Route path="parklar" element={<CitizenParksPage />} />
              <Route path="talep-olustur" element={<CitizenRequestPage />} />
            </Route>
            <Route path="/seffaflik" element={<Navigate to="/vatandas" replace />} />

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

              {/* Talepler: vatandaşların oluşturduğu talepler/şikayetler — İşlem Geçmişi
                  ile aynı yetki seviyesi (ADMIN + HEADGARDENER), backend'de de aynı kısıt var. */}
              <Route
                path="/talepler"
                element={
                  <RequireRole allow={[ROLES.ADMIN, ROLES.HEADGARDENER]}>
                    <RequestsPage />
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
