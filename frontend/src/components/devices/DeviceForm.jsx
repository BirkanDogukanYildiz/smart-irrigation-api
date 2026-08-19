import { useState } from "react";
import Section from "../common/Section";
import Alert from "../common/Alert";
import Button from "../common/Button";
import LocationPicker from "./LocationPicker";
import { createDevice } from "../../api/devices";
import { ASSET_TYPES, assetTypeLabel } from "../../utils/assetTypes";
import { regionDisplayName } from "../../utils/regionDisplay";
import "../../styles/form.css";

export default function DeviceForm({
  regions,
  onCreated,
  showLocationPicker = true,
  location: controlledLocation = null,
  onRequestPin,
  requireLocation = false,
}) {
  const [regionId, setRegionId] = useState("");
  const [deviceNo, setDeviceNo] = useState("");
  const [assetType, setAssetType] = useState(ASSET_TYPES.SULAMA_CIHAZI);
  const [internalLocation, setInternalLocation] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // showLocationPicker=true iken (kendi mini haritası olan formlar, örn. Cihazlar
  // sayfası) konum kendi state'inde tutulur. showLocationPicker=false iken (örn.
  // Harita sayfası) konum üstteki ana haritadan pinlenir ve parent'tan controlled
  // olarak gelir (bkz. MapPage — formLocation).
  const location = showLocationPicker ? internalLocation : controlledLocation;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!regionId) {
      setError("Lütfen bir bölge seçin.");
      return;
    }
    if (!deviceNo) {
      setError("Lütfen cihaz numarası girin.");
      return;
    }
    if (requireLocation && !location) {
      setError("Lütfen haritadan bir konum pinleyin. Konum pinlemeden ekipman eklenemez.");
      return;
    }

    setSubmitting(true);
    try {
      await createDevice({
        regionId: Number(regionId),
        deviceNo: Number(deviceNo),
        assetType,
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
      });
      setSuccess("Ekipman başarıyla eklendi.");
      // Bölge ve Ekipman Türü BİLİNÇLİ OLARAK sıfırlanmıyor: aynı bölgede/türde arka
      // arkaya birden fazla cihaz eklemek çok yaygın bir akış (bkz. pin ile toplu
      // ekleme), her seferinde yeniden seçmeye zorlamak gereksiz sürtünme yaratıyordu.
      // Ekipman No ise boşaltılmak yerine bir sonraki muhtemel numaraya (+1) otomatik
      // ilerletiliyor — aynı numarayı aynı bölgede tekrar kullanmak zaten backend'de
      // "region + deviceNo" tekil kısıtına takılıp hataya yol açardı (bkz. SprinklerInfo
      // entity'sindeki @UniqueConstraint), bu yüzden "hiç değiştirmeme" yerine "kullanıcı
      // adına mantıklı bir sonraki değeri önerme" tercih edildi — kullanıcı dilerse üzerine yazabilir.
      setDeviceNo((prev) => String(Number(prev) + 1));
      if (showLocationPicker) setInternalLocation(null);
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section title="Yeni Ekipman Ekle" subtitle="Var olan bir bölgeye yeni saha ekipmanı bağla.">
      <form onSubmit={handleSubmit}>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="deviceRegion">Bölge</label>
            <select id="deviceRegion" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
              <option value="">— Bölge seçin —</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {regionDisplayName(r)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="deviceNo">Ekipman No</label>
            <input
              id="deviceNo"
              type="number"
              value={deviceNo}
              onChange={(e) => setDeviceNo(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="assetType">Ekipman Türü</label>
            <select id="assetType" value={assetType} onChange={(e) => setAssetType(e.target.value)}>
              {Object.values(ASSET_TYPES).map((t) => (
                <option key={t} value={t}>
                  {assetTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showLocationPicker ? (
          <div className="form-field" style={{ marginBottom: "var(--space-4)" }}>
            <label>Harita Konumu (opsiyonel)</label>
            <p className="hint" style={{ marginBottom: 4 }}>
              Boş bırakırsanız konum daha sonra Harita sayfasından da ayarlanabilir.
            </p>
            <LocationPicker value={location} onChange={setInternalLocation} />
          </div>
        ) : (
          <div className="form-field" style={{ marginBottom: "var(--space-4)" }}>
            <label>
              Harita Konumu {requireLocation ? <span style={{ color: "var(--color-danger)" }}>*</span> : "(opsiyonel)"}
            </label>
            {location ? (
              <p className="hint" style={{ marginBottom: 4 }}>
                <b style={{ color: "var(--color-text)" }}>Pinlendi:</b> {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            ) : (
              <p className="hint" style={{ marginBottom: 4, color: requireLocation ? "var(--color-danger)" : undefined }}>
                {requireLocation
                  ? "Henüz konum pinlenmedi — üstteki haritadan pinlemeniz gerekiyor."
                  : "Konum seçilmedi."}
              </p>
            )}
            <Button type="button" variant="secondary" size="sm" onClick={onRequestPin}>
              {location ? "Konumu Haritadan Değiştir" : "Haritadan Pinle"}
            </Button>
          </div>
        )}

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Ekleniyor..." : "Ekipman Ekle"}
          </Button>
        </div>
      </form>
    </Section>
  );
}
