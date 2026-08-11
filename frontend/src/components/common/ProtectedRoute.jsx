import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// requireLogin() karşılığı
export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/giris" replace />;
  return children;
}

// requireAdmin() / requireManager() karşılığı
export function RequireRole({ allow, children }) {
  const { role } = useAuth();
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}
