// Merkezi API istemcisi. Backend endpointlerini/kontratlarını değiştirmez;
// eski common.js içindeki apiCall mantığının React karşılığıdır.

const API_BASE = "";

export function getToken() {
  return localStorage.getItem("token");
}
export function getRole() {
  return localStorage.getItem("role");
}
export function getUsername() {
  return localStorage.getItem("username");
}

export function saveSession({ token, role, username }) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("username", username);
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
}

/**
 * Tüm API çağrılarının geçtiği tek nokta.
 * 401 durumunda oturumu temizler; yönlendirme çağıran taraf (AuthContext) sorumluluğundadır.
 */
export async function apiCall(path, options = {}) {
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    const err = new Error("Oturum sona erdi, tekrar giriş yap.");
    err.status = 401;
    throw err;
  }

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      data && data.message
        ? data.message
        : typeof data === "string" && data
        ? data
        : data && typeof data === "object"
        ? Object.values(data)[0]
        : "Bir hata oluştu.";
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}
