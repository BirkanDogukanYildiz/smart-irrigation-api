import { apiCall } from "./client";

// GET /api/notifications/list -> NotificationResponseDto[]
export function listNotifications() {
  return apiCall("/api/notifications/list");
}

// GET /api/notifications/unread-count -> { count: number }
export function getUnreadNotificationCount() {
  return apiCall("/api/notifications/unread-count");
}

// PUT /api/notifications/{id}/read
export function markNotificationRead(id) {
  return apiCall(`/api/notifications/${id}/read`, { method: "PUT" });
}

// PUT /api/notifications/read-all
export function markAllNotificationsRead() {
  return apiCall("/api/notifications/read-all", { method: "PUT" });
}
