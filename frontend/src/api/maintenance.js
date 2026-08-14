import { apiCall } from "./client";

// POST /api/maintenance/{deviceId} { maintenanceDate, nextMaintenanceDate?, description? }
export function addMaintenanceRecord(deviceId, payload) {
  return apiCall(`/api/maintenance/${deviceId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// GET /api/maintenance/{deviceId} -> MaintenanceRecordResponseDto[]
export function getMaintenanceHistory(deviceId) {
  return apiCall(`/api/maintenance/${deviceId}`);
}
