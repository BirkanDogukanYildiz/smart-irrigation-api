import { apiCall } from "./client";

// GET /api/requests?topic=&status= -> CitizenRequestResponseDto[] (ADMIN+HEADGARDENER)
// Basit/filtresiz liste — filtre seçenekleri (konu/park vb.) türetmek için kullanılıyor.
export function listRequests({ topic, status } = {}) {
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (status) params.set("status", status);
  const qs = params.toString();
  return apiCall(`/api/requests${qs ? `?${qs}` : ""}`);
}

// GET /api/requests/search?page=&size=&topic=&status=&q=&dateFrom=&dateTo=
// -> PageResponseDto<CitizenRequestResponseDto> (ADMIN+HEADGARDENER)
// Talepler sayfasının asıl kullandığı uç nokta — İşlem Geçmişi (searchLogs) ile aynı desen.
export function searchRequests({ page, size, topic, status, q, dateFrom, dateTo } = {}) {
  const params = new URLSearchParams();
  if (page != null) params.set("page", page);
  if (size != null) params.set("size", size);
  if (topic) params.set("topic", topic);
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  const qs = params.toString();
  return apiCall(`/api/requests/search${qs ? `?${qs}` : ""}`);
}

// PUT /api/requests/{id}/status { status, note? } -> CitizenRequestResponseDto (ADMIN+HEADGARDENER)
// status: YENI | INCELENIYOR | INCELENDI — iki yönlü geçiş desteklenir. note opsiyonel.
export function updateRequestStatus(id, status, note) {
  return apiCall(`/api/requests/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, note: note || null }),
  });
}
