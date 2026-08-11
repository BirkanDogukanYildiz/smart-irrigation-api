import { apiCall } from "./client";

// GET /api/region/list -> RegionResponseDto[]
export function listRegions() {
  return apiCall("/api/region/list");
}

// POST /api/region/save (regionNo backend tarafından otomatik atanır, göndermeye gerek yok)
export function createRegion(payload) {
  return apiCall("/api/region/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// PUT /api/region/{id}/head-gardener { headGardenerId }
export function assignRegionHeadGardener(id, headGardenerId) {
  return apiCall(`/api/region/${id}/head-gardener`, {
    method: "PUT",
    body: JSON.stringify({ headGardenerId }),
  });
}

// DELETE /api/region/delete/{id}
export function deleteRegion(id) {
  return apiCall(`/api/region/delete/${id}`, { method: "DELETE" });
}
