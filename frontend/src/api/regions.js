import { apiCall } from "./client";

// GET /api/region/list -> RegionResponseDto[]
export function listRegions() {
  return apiCall("/api/region/list");
}

// GET /api/region/{id} -> RegionResponseDto
// /bolgeler/:id detay sayfası için.
export function getRegion(id) {
  return apiCall(`/api/region/${id}`);
}

// GET /api/region/districts -> NamedOptionDto[] { no, name }
// Bölge formunda "var olan ilçeyi seç" dropdown'ı için.
export function listDistricts() {
  return apiCall("/api/region/districts");
}

// GET /api/region/park-alanlari -> NamedOptionDto[] { no, name }
export function listParkAlanlari() {
  return apiCall("/api/region/park-alanlari");
}

// POST /api/region/save (regionNo, districtNo, irrigationAreaNo backend tarafından
// otomatik atanır — payload sadece isim gönderir, numara elle girilmez)
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
