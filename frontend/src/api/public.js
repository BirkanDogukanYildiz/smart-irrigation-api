import { apiCall } from "./client";

// GET /api/public/ozet -> PublicSummaryDto (kimlik doğrulama gerektirmez)
export function getPublicSummary() {
  return apiCall("/api/public/ozet");
}

// GET /api/public/regions -> PublicRegionOptionDto[] (kimlik doğrulama gerektirmez)
// Talep formundaki "Hangi park/bölge ile ilgili?" dropdown'u için.
export function getPublicRegionOptions() {
  return apiCall("/api/public/regions");
}

// GET /api/public/parks -> PublicParkDto[] (kimlik doğrulama gerektirmez)
// Personel tarafında zone'u (boundary) çizilmiş bölgeler — vatandaş haritasında
// centroid'e yerleştirilen park pinleri için (bkz. utils/geo.js, CitizenParkMap.jsx).
export function getPublicParks() {
  return apiCall("/api/public/parks");
}

// POST /api/public/requests { topic, fullName, contact?, regionId?, message } -> CitizenRequestResponseDto
// Kimlik doğrulama gerektirmez — vatandaş talep/şikayet oluşturma.
export function createCitizenRequest(payload) {
  return apiCall("/api/public/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
