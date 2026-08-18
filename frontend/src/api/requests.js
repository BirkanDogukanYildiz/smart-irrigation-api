import { apiCall } from "./client";

// GET /api/requests?topic=&status= -> CitizenRequestResponseDto[] (ADMIN+HEADGARDENER)
export function listRequests({ topic, status } = {}) {
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (status) params.set("status", status);
  const qs = params.toString();
  return apiCall(`/api/requests${qs ? `?${qs}` : ""}`);
}

// PUT /api/requests/{id}/incelendi -> CitizenRequestResponseDto (ADMIN+HEADGARDENER)
export function markRequestReviewed(id) {
  return apiCall(`/api/requests/${id}/incelendi`, { method: "PUT" });
}
