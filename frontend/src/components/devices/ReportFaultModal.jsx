import { useState } from "react";
import { deviceDisplayName } from "../../utils/deviceDisplay";
import { FAULT_TYPES, OTHER_FAULT_TYPE } from "../../utils/faultTypes";
import Button from "../common/Button";
import Alert from "../common/Alert";
import "../../styles/form.css";

// "Arıza Bildir" butonuna basılınca açılan form. Eskiden burası iki ayrı
// window.prompt() ile (önce açıklama, sonra opsiyonel arıza türü serbest metin)
// çalışıyordu — artık tek bir modal içinde, arıza türü önceden tanımlı bir
// listeden seçiliyor ("Diğer" seçilirse serbest metin alanı açılıyor).
export default function ReportFaultModal({ device, onSubmit, onClose }) {
  const [faultType, setFaultType] = useState(FAULT_TYPES[0]);
  const [customFaultType, setCustomFaultType] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!device) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Arıza açıklaması boş olamaz.");
      return;
    }
    if (faultType === OTHER_FAULT_TYPE && !customFaultType.trim()) {
      setError("Lütfen arıza türünü yazın.");
      return;
    }

    const resolvedFaultType = faultType === OTHER_FAULT_TYPE ? customFaultType.trim() : faultType;

    setSubmitting(true);
    try {
      await onSubmit(description.trim(), resolvedFaultType);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={submitting ? undefined : onClose}
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
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          maxWidth: 460,
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
            <h3 style={{ margin: 0, color: "var(--color-danger)" }}>Arıza Bildir</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
              {deviceDisplayName(device)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Kapat"
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "var(--space-5)" }}>
          <Alert type="error">{error}</Alert>

          <div className="form-field" style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="faultType">Arıza Türü</label>
            <select id="faultType" value={faultType} onChange={(e) => setFaultType(e.target.value)}>
              {FAULT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {faultType === OTHER_FAULT_TYPE && (
            <div className="form-field" style={{ marginBottom: "var(--space-4)" }}>
              <label htmlFor="customFaultType">Arıza Türünü Yaz</label>
              <input
                id="customFaultType"
                type="text"
                value={customFaultType}
                onChange={(e) => setCustomFaultType(e.target.value)}
                placeholder="Örn. Kemirgen Hasarı"
                autoFocus
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="faultDescription">Açıklama</label>
            <textarea
              id="faultDescription"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Arızayı kısaca açıklayın..."
            />
          </div>
        </div>

        <div
          style={{
            padding: "0 var(--space-5) var(--space-5)",
            display: "flex",
            gap: "var(--space-3)",
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting} style={{ flex: 1 }}>
            İptal
          </Button>
          <Button type="submit" variant="danger" disabled={submitting} style={{ flex: 1 }}>
            {submitting ? "Bildiriliyor..." : "Arızayı Bildir"}
          </Button>
        </div>
      </form>
    </div>
  );
}
