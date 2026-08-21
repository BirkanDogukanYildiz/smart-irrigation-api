import { useState } from "react";
import Section from "../components/common/Section";
import PageHeader from "../components/common/PageHeader";
import Alert from "../components/common/Alert";
import Button from "../components/common/Button";
import { updateMyAvatar } from "../api/auth";
import { compressImageToDataUrl } from "../utils/imageCompress";
import { useAuth } from "../context/AuthContext";
import { roleLabel } from "../utils/roles";

// Kendi profilini görüntüleme + avatar yükleme/kaldırma. Cihaz arıza fotoğrafıyla
// aynı desen (utils/imageCompress.js) — ayrı dosya sunucusu yok, data-URL olarak saklanır.
export default function ProfilePage() {
  const { username, role, photoBase64, setPhoto } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const initial = (username || "?").charAt(0).toUpperCase();

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setProcessing(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const profile = await updateMyAvatar(dataUrl);
      setPhoto(profile.photoBase64);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleRemovePhoto() {
    setError("");
    setProcessing(true);
    try {
      await updateMyAvatar(null);
      setPhoto(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      <PageHeader title="Profil" subtitle="Hesap bilgileriniz ve profil fotoğrafınız." />

      <Section>
        <Alert type="error">{error}</Alert>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", flexWrap: "wrap" }}>
          {photoBase64 ? (
            <img
              src={photoBase64}
              alt={username}
              style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--color-border)" }}
            />
          ) : (
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                background: "var(--color-primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              {initial}
            </div>
          )}

          <div>
            <h3 style={{ margin: "0 0 4px" }}>{username}</h3>
            <p style={{ margin: "0 0 12px", color: "var(--color-text-muted)", fontSize: 13.5 }}>{roleLabel(role)}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
                {photoBase64 ? "Fotoğrafı Değiştir" : "Fotoğraf Yükle"}
                <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={processing} style={{ display: "none" }} />
              </label>
              {photoBase64 && (
                <Button variant="ghost" size="sm" onClick={handleRemovePhoto} disabled={processing}>
                  Kaldır
                </Button>
              )}
            </div>
            {processing && <p className="hint" style={{ marginTop: 8 }}>İşleniyor...</p>}
          </div>
        </div>
      </Section>
    </>
  );
}
