import { useState, useEffect } from "react";
import Button from "../common/Button";
import "../../styles/form.css";

// "İncelendi" işaretlerken açılan modal: açıklama TAMAMEN opsiyonel — boş bırakılıp
// da "İncelendi Olarak İşaretle" ile devam edilebilir (bkz. onConfirm(null)). Sadece
// bu geçiş (→ İncelendi) için gösteriliyor; diğer durum geçişleri (İncelenmedi ⇄
// İnceleniyor gibi) doğrudan, modal olmadan uygulanıyor (bkz. RequestTable.jsx).
export default function RequestReviewModal({ request, onConfirm, onClose }) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal parent'ta koşulsuz render ediliyor (component hiç unmount olmuyor), bu
  // yüzden farklı bir talep için tekrar açıldığında önceki notun kalıntısı
  // görünmesin diye burada sıfırlıyoruz.
  useEffect(() => {
    if (request) {
      setNote("");
      setSubmitting(false);
    }
  }, [request]);

  if (!request) return null;

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm(note.trim() || null);
    } finally {
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
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ padding: "var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
          <h3 style={{ margin: 0 }}>Talep incelendi</h3>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
            "{request.fullName}" tarafından oluşturulan talep incelendi olarak işaretlenecek. Açıklama eklemek ister
            misiniz?
          </p>
        </div>

        <div style={{ padding: "var(--space-5)" }}>
          <div className="form-field">
            <label htmlFor="reviewNote">Açıklama (opsiyonel)</label>
            <textarea
              id="reviewNote"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn. 'Ekip yönlendirildi, 2 gün içinde onarılacak.' — boş da bırakabilirsiniz."
              autoFocus
            />
          </div>
        </div>

        <div style={{ padding: "0 var(--space-5) var(--space-5)", display: "flex", gap: "var(--space-3)" }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting} style={{ flex: 1 }}>
            İptal
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={submitting} style={{ flex: 1 }}>
            {submitting ? "Kaydediliyor..." : "İncelendi Olarak İşaretle"}
          </Button>
        </div>
      </div>
    </div>
  );
}
