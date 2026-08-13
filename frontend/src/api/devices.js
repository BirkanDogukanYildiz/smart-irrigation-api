import { apiCall } from "./client";

// GET /api/devices/list -> SprinklerInfoResponseDto[]
export function listDevices() {
  return apiCall("/api/devices/list");
}

// POST /api/devices/save { regionId, deviceNo, assetType?, latitude?, longitude? }
export function createDevice(payload) {
  return apiCall("/api/devices/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUT /api/devices/status/{id} { status, description?, faultType? }
export function updateDeviceStatus(id, status, description, faultType) {
  return apiCall(`/api/devices/status/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status, description, faultType }),
  });
}

// PUT /api/devices/location/{id} { latitude, longitude }
export function updateDeviceLocation(id, latitude, longitude) {
  return apiCall(`/api/devices/location/${id}`, {
    method: "PUT",
    body: JSON.stringify({ latitude, longitude }),
  });
}

// DELETE /api/devices/delete/{id}
export function deleteDevice(id) {
  return apiCall(`/api/devices/delete/${id}`, { method: "DELETE" });
}
