import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getRole, getToken, getUsername, saveSession, clearSession } from "../api/client";
import { login as loginRequest } from "../api/auth";

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
