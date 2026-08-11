import { apiCall } from "./client";

// GET /api/dashboard/summary -> DashboardResponseDto
export function getDashboardSummary() {
  return apiCall("/api/dashboard/summary");
}
