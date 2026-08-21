import { apiCall } from "./client";

// POST /api/auth/login -> LoginResponseDto { token, username, role, photoBase64 }
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

// GET /api/auth/me -> ProfileResponseDto { username, role, photoBase64 }
export function getMyProfile() {
  return apiCall("/api/auth/me");
}

// PUT /api/auth/me/avatar { photoBase64 } -> ProfileResponseDto
// photoBase64: null/boş gönderilirse avatar kaldırılır.
export function updateMyAvatar(photoBase64) {
  return apiCall("/api/auth/me/avatar", {
    method: "PUT",
    body: JSON.stringify({ photoBase64 }),
  });
}
