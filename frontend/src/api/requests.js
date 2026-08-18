import { apiCall } from "./client";

// GET /api/requests?topic=&status= -> CitizenRequestResponseDto[] (ADMIN+HEADGARDENER)
export function listRequests({ topic, status } = {}) {
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (status) params.set("status", status);
  const qs = params.toString();
  return apiCall(`/api/requests${qs ? `?${qs}` : ""}`);
}

// PUT /api/requests/{id}/status { status, note? } -> CitizenRequestResponseDto (ADMIN+HEADGARDENER)
// status: YENI | INCELENIYOR | INCELENDI — iki yönlü geçiş desteklenir. note opsiyonel.
export function updateRequestStatus(id, status, note) {
  return apiCall(`/api/requests/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, note: note || null }),
  });
}
