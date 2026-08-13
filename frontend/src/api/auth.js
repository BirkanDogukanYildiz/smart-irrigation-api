import { apiCall } from "./client";

// POST /api/auth/login -> LoginResponseDto { token, username, role }
export function login(username, password) {
  return apiCall("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// POST /api/auth/logout -> gerçek bir "Çıkış yapıldı" logu oluşturur.
// Token henüz temizlenmeden (AuthContext.logout içinde clearSession'dan ÖNCE) çağrılmalı,
// yoksa istek kimliksiz gider ve backend kullanıcı adını çözemez.
export function logout() {
  return apiCall("/api/auth/logout", { method: "POST" });
}
