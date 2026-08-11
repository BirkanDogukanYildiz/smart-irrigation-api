import { apiCall } from "./client";

// GET /api/logs/list -> AuditLogResponseDto[]
export function listLogs() {
  return apiCall("/api/logs/list");
}
