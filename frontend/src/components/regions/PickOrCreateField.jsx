import { useState } from "react";

// Numara elle girilmesin diye: kullanıcı ya var olan bir isimi listeden seçer
// (numarası backend'de zaten kayıtlı, otomatik eşleşir), ya da "+ Yeni Ekle" ile
// sadece isim girip yeni bir kayıt oluşturur (numarayı backend otomatik atar).
export default function PickOrCreateField({ id, label, options, value, onChange }) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {!creating ? (
        <>
          <select
            id={id}
            value={options.some((o) => o.name === value) ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">— Seçin —</option>
            {options.map((o) => (
              <option key={o.name} value={o.name}>
                {o.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              onChange("");
            }}
            style={{
              marginTop: 6,
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
            }}
          >
            + Yeni {label} Ekle
          </button>
        </>
      ) : (
        <>
          <input
            id={id}
            type="text"
            placeholder={`Yeni ${label.toLowerCase()} adı`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              onChange("");
            }}
            style={{
              marginTop: 6,
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              fontSize: 12,
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
            }}
          >
            ← Var olanlardan seç
          </button>
        </>
      )}
    </div>
  );
}
