import { formatDateTime } from "../../utils/format";
import { actionColors, resourceLabel } from "../../utils/auditActions";
import { roleLabel } from "../../utils/roles";
import Button from "../common/Button";

export default function LogDetailModal({ log, onClose }) {
  if (!log) return null;
  const colors = actionColors(log.action);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 32, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-4)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          maxWidth: 480,
          width: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            padding: "var(--space-5)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                fontSize: 12,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 999,
                background: colors.bg,
                color: colors.fg,
                marginBottom: 8,
              }}
            >
              {log.action}
            </span>
            <h3 style={{ margin: 0 }}>İşlem Detayı</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Kapat"
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "var(--space-5)" }}>
          <Row label="Tarih/Saat" value={formatDateTime(log.timestamp)} />
          <Row label="Kullanıcı" value={log.username} />
          <Row label="Kullanıcı Rolü" value={log.userRole ? roleLabel(log.userRole) : "—"} />
          <Row label="Kaynak Türü" value={resourceLabel(log.resourceType)} />
          <Row label="Kaynak ID" value={log.resourceId != null ? `#${log.resourceId}` : "—"} />
          <Row label="Açıklama" value={log.details} />
          {(log.oldValue || log.newValue) && (
            <>
              <Row label="Eski Değer" value={log.oldValue || "—"} />
              <Row label="Yeni Değer" value={log.newValue || "—"} last />
            </>
          )}
        </div>

        <div style={{ padding: "0 var(--space-5) var(--space-5)" }}>
          <Button variant="secondary" onClick={onClose} style={{ width: "100%" }}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "8px 0",
        borderBottom: last ? "none" : "1px solid var(--color-border)",
        fontSize: 13.5,
      }}
    >
      <span style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>{label}</span>
      <strong style={{ color: "var(--color-text)", textAlign: "right" }}>{value}</strong>
    </div>
  );
}
