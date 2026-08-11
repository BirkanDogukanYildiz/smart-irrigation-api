import { apiCall } from "./client";

// POST /api/auth/login -> LoginResponseDto { token, username, role }
export function login(username, password) {
  return apiCall("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
