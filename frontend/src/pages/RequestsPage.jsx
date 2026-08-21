import { useEffect, useState } from "react";
import Section from "../components/common/Section";
import PageHeader from "../components/common/PageHeader";
import Alert from "../components/common/Alert";
import PaginationControls from "../components/common/PaginationControls";
import RequestTable from "../components/requests/RequestTable";
import RequestReviewModal from "../components/requests/RequestReviewModal";
import { listRequests, searchRequests, updateRequestStatus } from "../api/requests";
import { REQUEST_TOPICS, REQUEST_STATUS, requestTopicLabel, requestStatusLabel } from "../utils/requestTopics";

const PAGE_SIZE = 20;

// Vatandaşların (/vatandas üzerinden, girişsiz) oluşturduğu talepleri kronolojik
// bir log gibi listeler — İşlem Geçmişi (LogsPage) ile AYNI filtre/sayfalama deseni:
// konu/durum dropdown'ları, tarih aralığı, metinde arama, server-side sayfalama.
// Görünürlük: ADMIN tüm talepleri görür, HEADGARDENER SADECE sorumlu olduğu
// bölgelerle ilgili talepleri görür (bkz. backend CitizenRequestService).
//
// Durum akışı üç aşamalı ve İKİ YÖNLÜ: İncelenmedi ⇄ İnceleniyor ⇄ İncelendi.
// "İncelendi"ye geçişte opsiyonel bir açıklama modalı açılıyor (bkz. RequestReviewModal);
// diğer geçişler doğrudan uygulanıyor.
export default function RequestsPage() {
  const [requests, setRequests] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);

  const [error, setError] = useState("");
  const [reviewingRequest, setReviewingRequest] = useState(null);

  // Filtre dropdown seçenekleri (konu) — sayfalanmış tablo verisinden BAĞIMSIZ,
  // (görünürlük kuralı uygulanmış) tüm taleplerden bir kez türetiliyor; yoksa
  // dropdown sadece o an görünen sayfadaki değerleri gösterirdi.
  const [filterOptions, setFilterOptions] = useState({ topics: [] });

  const [topicFilter, setTopicFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    listRequests()
      .then((all) => {
        setFilterOptions({ topics: [...new Set(all.map((r) => r.topic))].sort() });
      })
      .catch(() => {
        // Filtre seçenekleri yüklenemezse dropdown boş kalır, arama yine de çalışır.
      });
  }, []);

  async function loadRequests() {
    try {
      const result = await searchRequests({
        page,
        size: PAGE_SIZE,
        topic: topicFilter || undefined,
        status: statusFilter || undefined,
        q: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setRequests(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, topicFilter, statusFilter, dateFrom, dateTo, search]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicFilter, statusFilter, dateFrom, dateTo, search]);

  const hasActiveFilter = topicFilter || statusFilter || dateFrom || dateTo || search;

  function clearFilters() {
    setTopicFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  }

  async function handleStatusChange(request, newStatus) {
    // "İncelendi" hedefse: doğrudan uygulamak yerine opsiyonel açıklama modalını aç.
    // Diğer geçişler (İncelenmedi ⇄ İnceleniyor gibi) anında uygulanır.
    if (newStatus === REQUEST_STATUS.INCELENDI) {
      setReviewingRequest(request);
      return;
    }
    try {
      await updateRequestStatus(request.id, newStatus, null);
      loadRequests();
    } catch (e) {
      window.alert("Talep güncellenemedi: " + e.message);
    }
  }

  async function handleReviewConfirm(note) {
    try {
      await updateRequestStatus(reviewingRequest.id, REQUEST_STATUS.INCELENDI, note);
      setReviewingRequest(null);
      loadRequests();
    } catch (e) {
      window.alert("Talep güncellenemedi: " + e.message);
    }
  }

  return (
    <>
      <PageHeader title="Talepler" subtitle="Vatandaşların /vatandas üzerinden oluşturduğu talep ve şikayetler." />

      <Section title="Talep Listesi">
        <Alert type="error">{error}</Alert>

        <div className="form-grid" style={{ marginBottom: "var(--space-4)" }}>
          <div className="form-field">
            <label htmlFor="reqTopicFilter">Konu</label>
            <select id="reqTopicFilter" value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}>
              <option value="">Tümü</option>
              {(filterOptions.topics.length ? filterOptions.topics : Object.values(REQUEST_TOPICS)).map((t) => (
                <option key={t} value={t}>
                  {requestTopicLabel(t)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="reqStatusFilter">Durum</label>
            <select id="reqStatusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tümü</option>
              {Object.values(REQUEST_STATUS).map((s) => (
                <option key={s} value={s}>
                  {requestStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="reqDateFrom">Başlangıç Tarihi</label>
            <input id="reqDateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="reqDateTo">Bitiş Tarihi</label>
            <input id="reqDateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="reqSearch">Ara</label>
            <input
              id="reqSearch"
              type="text"
              placeholder="Ad soyad, mesaj, park, not..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {hasActiveFilter && (
          <p className="hint" style={{ marginBottom: "var(--space-3)" }}>
            {totalElements} talep bulundu.{" "}
            <button
              type="button"
              onClick={clearFilters}
              style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", padding: 0 }}
            >
              Filtreleri temizle
            </button>
          </p>
        )}

        <RequestTable requests={requests} onStatusChange={handleStatusChange} />
        <PaginationControls page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
      </Section>

      <RequestReviewModal
        request={reviewingRequest}
        onConfirm={handleReviewConfirm}
        onClose={() => setReviewingRequest(null)}
      />
    </>
  );
}
