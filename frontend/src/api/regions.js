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

// PUT /api/region/{id}/boundary { boundary }
// coords: [[lat, lng], [lat, lng], ...] dizisi (en az 3 nokta). null gönderilirse zone kaldırılır.
export function updateRegionBoundary(id, coords) {
  return apiCall(`/api/region/${id}/boundary`, {
    method: "PUT",
    body: JSON.stringify({ boundary: coords ? JSON.stringify(coords) : null }),
  });
}

// DELETE /api/region/delete/{id}
export function deleteRegion(id) {
  return apiCall(`/api/region/delete/${id}`, { method: "DELETE" });
}
