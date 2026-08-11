import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { ROLES } from "./utils/roles";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/giris" element={<LoginPage />} />

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
  );
}
