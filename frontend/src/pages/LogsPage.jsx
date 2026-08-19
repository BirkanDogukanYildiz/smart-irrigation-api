import { useEffect, useMemo, useState } from "react";
import Section from "../components/common/Section";
import PageHeader from "../components/common/PageHeader";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import PaginationControls from "../components/common/PaginationControls";
import LogTable from "../components/logs/LogTable";
import LogDetailModal from "../components/logs/LogDetailModal";
import { listLogs, searchLogs } from "../api/logs";
import { exportLogsCsv } from "../api/export";
import { resourceLabel } from "../utils/auditActions";

const PAGE_SIZE = 20;

export default function LogsPage() {
  const [logs, setLogs] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);

  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  // Filtre dropdown seçenekleri (işlem türü/kullanıcı/kaynak) — sayfalanmış tablo
  // verisinden BAĞIMSIZ, tüm loglardan (bir kez, filtresiz) türetiliyor; yoksa
  // dropdown sadece o an görünen sayfadaki değerleri gösterirdi.
  const [filterOptions, setFilterOptions] = useState({ actions: [], users: [], resourceTypes: [] });

  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    listLogs()
      .then((all) => {
        setFilterOptions({
          actions: [...new Set(all.map((l) => l.action))].sort(),
          users: [...new Set(all.map((l) => l.username))].sort(),
          resourceTypes: [...new Set(all.map((l) => l.resourceType).filter(Boolean))].sort(),
        });
      })
      .catch(() => {
        // Filtre seçenekleri yüklenemezse dropdown'lar boş kalır, arama yine de çalışır.
      });
  }, []);

  async function loadLogs() {
    try {
      const result = await searchLogs({
        page,
        size: PAGE_SIZE,
        action: actionFilter || undefined,
        username: userFilter || undefined,
        resourceType: resourceFilter || undefined,
        q: search || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setLogs(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter, userFilter, resourceFilter, dateFrom, dateTo, search]);

  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter, userFilter, resourceFilter, dateFrom, dateTo, search]);

  const hasActiveFilter = actionFilter || userFilter || resourceFilter || dateFrom || dateTo || search;

  function clearFilters() {
    setActionFilter("");
    setUserFilter("");
    setResourceFilter("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  }

  async function handleExport() {
    try {
      await exportLogsCsv();
    } catch (e) {
      window.alert("İndirme başarısız: " + e.message);
    }
  }

  return (
    <>
      <PageHeader title="İşlem Geçmişi" subtitle="Sistemde yapılan işlemlerin ayrıntılı kaydı." />

      <Section
        title="Kayıtlar"
        actions={
          <Button size="sm" variant="secondary" onClick={handleExport}>
            Dışa Aktar (CSV)
          </Button>
        }
      >
      <Alert type="error">{error}</Alert>

      <div className="form-grid" style={{ marginBottom: "var(--space-4)" }}>
        <div className="form-field">
          <label htmlFor="logActionFilter">İşlem Türü</label>
          <select id="logActionFilter" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="">Tümü</option>
            {filterOptions.actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="logUserFilter">Kullanıcı</label>
          <select id="logUserFilter" value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
            <option value="">Tümü</option>
            {filterOptions.users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="logResourceFilter">Kaynak/Tür</label>
          <select id="logResourceFilter" value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
            <option value="">Tümü</option>
            {filterOptions.resourceTypes.map((r) => (
              <option key={r} value={r}>
                {resourceLabel(r)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="logDateFrom">Başlangıç Tarihi</label>
          <input id="logDateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="logDateTo">Bitiş Tarihi</label>
          <input id="logDateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="logSearch">Detayda Ara</label>
          <input
            id="logSearch"
            type="text"
            placeholder="Örn. cihaz numarası, sebep..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {hasActiveFilter && (
        <p className="hint" style={{ marginBottom: "var(--space-3)" }}>
          {totalElements} kayıt bulundu.{" "}
          <button
            type="button"
            onClick={clearFilters}
            style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", padding: 0 }}
          >
            Filtreleri temizle
          </button>
        </p>
      )}

      <LogTable logs={logs} onViewDetail={setSelectedLog} />
      <PaginationControls page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />

      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      </Section>
    </>
  );
}
