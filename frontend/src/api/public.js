import { apiCall } from "./client";

// GET /api/public/ozet -> PublicSummaryDto (kimlik doğrulama gerektirmez)
export function getPublicSummary() {
  return apiCall("/api/public/ozet");
}
