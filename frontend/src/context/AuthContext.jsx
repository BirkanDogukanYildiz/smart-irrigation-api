import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getRole, getToken, getUsername, saveSession, clearSession } from "../api/client";
import { login as loginRequest, logout as logoutRequest } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => ({
    token: getToken(),
    role: getRole(),
    username: getUsername(),
  }));

  const login = useCallback(async (username, password) => {
    const response = await loginRequest(username, password);
    saveSession(response);
    setSession({
      token: response.token,
      role: response.role,
      username: response.username,
    });
    return response;
  }, []);

  const logout = useCallback(() => {
    // Token'ı temizlemeden ÖNCE backend'e haber veriyoruz ki gerçek kullanıcı adıyla
    // "Çıkış yapıldı" logu oluşabilsin. Best-effort: istek başarısız olsa bile
    // (ör. token zaten süresi dolmuşsa) kullanıcı yine de çıkış yapabilmeli.
    logoutRequest().catch(() => {
      // Sessizce yut — çıkışı asla engellemeyelim.
    });
    clearSession();
    setSession({ token: null, role: null, username: null });
  }, []);

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated: Boolean(session.token),
      login,
      logout,
    }),
    [session, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
