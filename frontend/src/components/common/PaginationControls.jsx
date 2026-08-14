import Button from "./Button";

// page: 0-tabanlı. Cihazlar/Kullanıcılar/Loglar sayfalarında ortak kullanılıyor.
export default function PaginationControls({ page, totalPages, totalElements, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: "var(--space-4)" }}>
      <Button size="sm" variant="secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 0}>
        ← Önceki
      </Button>
      <span className="hint">
        Sayfa {page + 1} / {totalPages} ({totalElements} kayıt)
      </span>
      <Button size="sm" variant="secondary" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
        Sonraki →
      </Button>
    </div>
  );
}
