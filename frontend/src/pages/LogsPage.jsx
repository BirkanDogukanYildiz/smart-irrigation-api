import { useEffect, useMemo, useState } from "react";
import Section from "../components/common/Section";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import LogTable from "../components/logs/LogTable";
import LogDetailModal from "../components/logs/LogDetailModal";
import { listLogs } from "../api/logs";
import { resourceLabel } from "../utils/auditActions";

const PAGE_SIZE = 20;

export default function LogsPage() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    listLogs()
      .then(setLogs)
      .catch((e) => setError(e.message));
  }, []);

  const actions = useMemo(() => {
    if (!logs) return [];
    return [...new Set(logs.map((l) => l.action))].sort();
  }, [logs]);

  const users = useMemo(() => {
    if (!logs) return [];
    return [...new Set(logs.map((l) => l.username))].sort();
  }, [logs]);

  const resourceTypes = useMemo(() => {
    if (!logs) return [];
    return [...new Set(logs.map((l) => l.resourceType).filter(Boolean))].sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (!logs) return logs;
    const searchLower = search.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;

    return logs.filter((l) => {
      if (actionFilter && l.action !== actionFilter) return false;
      if (userFilter && l.username !== userFilter) return false;
      if (resourceFilter && l.resourceType !== resourceFilter) return false;
      if (from || to) {
        const ts = l.timestamp ? new Date(l.timestamp) : null;
        if (!ts || Number.isNaN(ts.getTime())) return false;
        if (from && ts < from) return false;
        if (to && ts > to) return false;
      }
      if (searchLower && !(l.details || "").toLowerCase().includes(searchLower)) return false;
      return true;
    });
  }, [logs, actionFilter, userFilter, resourceFilter, dateFrom, dateTo, search]);

  // Filtre değiştiğinde sayfayı başa al — yoksa 3. sayfadayken filtre daraltılırsa boş sayfa görünebilir.
  useEffect(() => {
    setPage(1);
  }, [actionFilter, userFilter, resourceFilter, dateFrom, dateTo, search]);

  const totalPages = filteredLogs ? Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE)) : 1;
  const pagedLogs = useMemo(() => {
    if (!filteredLogs) return filteredLogs;
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);

  function clearFilters() {
    setActionFilter("");
    setUserFilter("");
    setResourceFilter("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  }

  const hasActiveFilter = actionFilter || userFilter || resourceFilter || dateFrom || dateTo || search;

  return (
    <Section title="İşlem Geçmişi" subtitle="Sistemde yapılan işlemlerin ayrıntılı kaydı.">
      <Alert type="error">{error}</Alert>

      {logs && logs.length > 0 && (
        <div className="form-grid" style={{ marginBottom: "var(--space-4)" }}>
          <div className="form-field">
            <label htmlFor="logActionFilter">İşlem Türü</label>
            <select id="logActionFilter" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="">Tümü</option>
              {actions.map((a) => (
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
              {users.map((u) => (
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
              {resourceTypes.map((r) => (
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
      )}

      {hasActiveFilter && filteredLogs && (
        <p className="hint" style={{ marginBottom: "var(--space-3)" }}>
          {filteredLogs.length} / {logs.length} kayıt gösteriliyor.{" "}
          <button
            type="button"
            onClick={clearFilters}
            style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", padding: 0 }}
          >
            Filtreleri temizle
          </button>
        </p>
      )}

      <LogTable logs={pagedLogs} onViewDetail={setSelectedLog} />

      {filteredLogs && filteredLogs.length > PAGE_SIZE && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: "var(--space-4)" }}>
          <Button size="sm" variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            ← Önceki
          </Button>
          <span className="hint">
            Sayfa {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sonraki →
          </Button>
        </div>
      )}

      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </Section>
  );
}
