import { apiCall } from "./client";

// GET /api/user/list -> UserResponseDto[]
export function listUsers() {
  return apiCall("/api/user/list");
}

// GET /api/user/search?page=&size=&role=&q= -> PageResponseDto<UserResponseDto>
export function searchUsers({ page = 0, size = 20, role, q } = {}) {
  const params = new URLSearchParams({ page, size });
  if (role) params.set("role", role);
  if (q) params.set("q", q);
  return apiCall(`/api/user/search?${params.toString()}`);
}

// POST /api/user/register { username, password, role }
export function registerUser(payload) {
  return apiCall("/api/user/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// DELETE /api/user/delete { username }
export function deleteUser(username) {
  return apiCall("/api/user/delete", {
    method: "DELETE",
    body: JSON.stringify({ username }),
  });
}

// PUT /api/user/{id}/head-gardener { headGardenerId }
export function assignUserHeadGardener(id, headGardenerId) {
  return apiCall(`/api/user/${id}/head-gardener`, {
    method: "PUT",
    body: JSON.stringify({ headGardenerId }),
  });
}
