import { apiCall } from "./client";

// GET /api/logs/list -> AuditLogResponseDto[]
export function listLogs() {
  return apiCall("/api/logs/list");
}

// GET /api/logs/search?page=&size=&action=&username=&resourceType=&q=&dateFrom=&dateTo=
// -> PageResponseDto<AuditLogResponseDto>
export function searchLogs({ page = 0, size = 20, action, username, resourceType, q, dateFrom, dateTo } = {}) {
  const params = new URLSearchParams({ page, size });
  if (action) params.set("action", action);
  if (username) params.set("username", username);
  if (resourceType) params.set("resourceType", resourceType);
  if (q) params.set("q", q);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  return apiCall(`/api/logs/search?${params.toString()}`);
}
