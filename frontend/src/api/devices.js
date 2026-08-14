import { apiCall } from "./client";

// GET /api/devices/list -> SprinklerInfoResponseDto[]
export function listDevices() {
  return apiCall("/api/devices/list");
}

// GET /api/devices/search?page=&size=&status=&assetType=&regionId=&q=&sortBy=&sortDir=
// -> PageResponseDto<SprinklerInfoResponseDto>
export function searchDevices({ page = 0, size = 20, status, assetType, regionId, q, sortBy, sortDir } = {}) {
  const params = new URLSearchParams({ page, size });
  if (status) params.set("status", status);
  if (assetType) params.set("assetType", assetType);
  if (regionId) params.set("regionId", regionId);
  if (q) params.set("q", q);
  if (sortBy) params.set("sortBy", sortBy);
  if (sortDir) params.set("sortDir", sortDir);
  return apiCall(`/api/devices/search?${params.toString()}`);
}

// GET /api/devices/device-info/{id} -> SprinklerInfoResponseDto
// /cihazlar/:id detay sayfası için.
export function getDevice(id) {
  return apiCall(`/api/devices/device-info/${id}`);
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
